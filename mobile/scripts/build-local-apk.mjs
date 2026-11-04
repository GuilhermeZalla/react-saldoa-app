import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
    mkdir,
    readFile,
    rm,
    unlink,
    writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const mobileDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
);
const repositoryDirectory = path.dirname(mobileDirectory);
const environment = { ...process.env, SALDOA_LOCAL_APK: 'true' };

function configureAndroidEnvironment() {
    if (process.platform !== 'win32') {
        return;
    }

    const androidSdk =
        environment.ANDROID_HOME ??
        environment.ANDROID_SDK_ROOT ??
        path.join(environment.LOCALAPPDATA ?? '', 'Android', 'Sdk');

    if (!existsSync(path.join(androidSdk, 'platform-tools', 'adb.exe'))) {
        throw new Error(
            `Android SDK not found at "${androidSdk}". Install Android Studio or set ANDROID_HOME.`,
        );
    }

    environment.ANDROID_HOME = androidSdk;
    environment.ANDROID_SDK_ROOT = androidSdk;

    if (!environment.JAVA_HOME) {
        const androidStudioJdk = path.join(
            environment['ProgramFiles'] ?? 'C:\\Program Files',
            'Android',
            'Android Studio',
            'jbr',
        );

        if (existsSync(path.join(androidStudioJdk, 'bin', 'java.exe'))) {
            environment.JAVA_HOME = androidStudioJdk;
        }
    }

    if (
        !environment.JAVA_HOME ||
        !existsSync(path.join(environment.JAVA_HOME, 'bin', 'java.exe'))
    ) {
        throw new Error(
            'Java was not found. Install Android Studio or set JAVA_HOME to a JDK installation.',
        );
    }
}

function createShortWindowsPath(targetDirectory) {
    const driveLetter = 'ZYXWVUTSRQPONMLKJIHGFED'.split('').find(
        (letter) => !existsSync(`${letter}:\\`),
    );

    if (!driveLetter) {
        throw new Error('No unused drive letter is available for the local APK build.');
    }

    const drive = `${driveLetter}:`;
    const result = spawnSync('subst.exe', [drive, targetDirectory], {
        encoding: 'utf8',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Could not create the temporary ${drive} path for the APK build: ${result.stderr.trim()}`,
        );
    }

    return drive;
}

function removeShortWindowsPath(drive) {
    const result = spawnSync('subst.exe', [drive, '/d'], {
        encoding: 'utf8',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Could not remove the temporary ${drive} path: ${result.stderr.trim()}`,
        );
    }
}

function replacePathRoot(value, originalRoot, shortDrive) {
    if (typeof value === 'string') {
        return value
            .replaceAll(originalRoot, shortDrive)
            .replaceAll(originalRoot.replaceAll('\\', '/'), shortDrive);
    }

    if (Array.isArray(value)) {
        return value.map((entry) =>
            replacePathRoot(entry, originalRoot, shortDrive),
        );
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [
                key,
                replacePathRoot(entry, originalRoot, shortDrive),
            ]),
        );
    }

    return value;
}

function run(command, args, workingDirectory) {
    const result = spawnSync(command, args, {
        cwd: workingDirectory,
        env: environment,
        shell: process.platform === 'win32',
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Command "${command} ${args.join(' ')}" failed with exit code ${result.status ?? 1}.`,
        );
    }
}

async function buildLocalApk() {
    configureAndroidEnvironment();

    const isWindows = process.platform === 'win32';
    const temporaryDirectory =
        environment.TEMP ?? environment.TMP ?? mobileDirectory;
    const cmakeStagingDirectory = path.join(
        temporaryDirectory,
        `s${process.pid}`,
    );
    const gradleInitScript = path.join(
        temporaryDirectory,
        `s${process.pid}.gradle`,
    );
    const packageJsonPath = path.join(mobileDirectory, 'package.json');
    const autolinkingConfigPath = path.join(
        mobileDirectory,
        'android',
        'build',
        'generated',
        'autolinking',
        'autolinking.json',
    );
    let shortRepositoryDrive;
    let shortCmakeDrive;
    let originalAutolinkingConfig;
    let cmakeStagingDirectoryCreated = false;
    let gradleInitScriptCreated = false;

    try {
        let workingMobileDirectory = mobileDirectory;

        if (isWindows) {
            await mkdir(cmakeStagingDirectory);
            cmakeStagingDirectoryCreated = true;
            shortRepositoryDrive = createShortWindowsPath(repositoryDirectory);
            shortCmakeDrive = createShortWindowsPath(cmakeStagingDirectory);
            workingMobileDirectory = path.join(
                `${shortRepositoryDrive}\\`,
                'mobile',
            );

            const cmakeDrivePath = `${shortCmakeDrive}\\`.replaceAll(
                '\\',
                '\\\\',
            );
            const gradleInitContents = `
def shortCmakeStagingDirectory = new File("${cmakeDrivePath}")

def configureShortCmake = { project ->
    def android = project.extensions.findByName("android")
    def cmake = android?.externalNativeBuild?.cmake
    if (cmake != null) {
        cmake.buildStagingDirectory = shortCmakeStagingDirectory
        android.defaultConfig.externalNativeBuild.cmake.arguments.add(
            "-DCMAKE_OBJECT_PATH_MAX=240"
        )
    }
}

allprojects {
    def currentProject = it
    currentProject.plugins.withId("com.android.library") {
        configureShortCmake(currentProject)
    }
    currentProject.plugins.withId("com.android.application") {
        configureShortCmake(currentProject)
    }
    currentProject.afterEvaluate {
        configureShortCmake(currentProject)
        if (currentProject.name == "expo-modules-core") {
            currentProject.extensions
                .findByName("android")
                .defaultConfig.externalNativeBuild.cmake.arguments.add(
                    "-DCMAKE_SUPPRESS_REGENERATION=ON"
                )
        }
    }
}
`;

            await writeFile(gradleInitScript, gradleInitContents, 'utf8');
            gradleInitScriptCreated = true;
        }

        try {
            run(
                'npx',
                ['expo', 'prebuild', '--platform', 'android'],
                workingMobileDirectory,
            );
        } finally {
            const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
            packageJson.scripts.android = 'expo start --android';
            packageJson.scripts.ios = 'expo start --ios';
            await writeFile(
                packageJsonPath,
                `${JSON.stringify(packageJson, null, 2)}\n`,
                'utf8',
            );
        }

        const gradleWrapper =
            process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
        const gradleWorkingDirectory = path.join(
            workingMobileDirectory,
            'android',
        );

        if (isWindows) {
            run(gradleWrapper, ['help'], gradleWorkingDirectory);

            originalAutolinkingConfig = await readFile(
                autolinkingConfigPath,
                'utf8',
            );
            const autolinkingConfig = JSON.parse(originalAutolinkingConfig);
            const mappedConfig = replacePathRoot(
                autolinkingConfig,
                repositoryDirectory,
                shortRepositoryDrive,
            );

            if (
                JSON.stringify(mappedConfig) ===
                JSON.stringify(autolinkingConfig)
            ) {
                throw new Error(
                    'Could not map native module paths to the temporary short drive.',
                );
            }

            await writeFile(
                autolinkingConfigPath,
                `${JSON.stringify(mappedConfig, null, 2)}\n`,
                'utf8',
            );
        }

        run(
            gradleWrapper,
            [
                ...(isWindows ? ['-I', gradleInitScript] : []),
                '-PreactNativeArchitectures=arm64-v8a',
                'assembleRelease',
            ],
            gradleWorkingDirectory,
        );

        const apkPath = path.join(
            mobileDirectory,
            'android',
            'app',
            'build',
            'outputs',
            'apk',
            'release',
            'app-release.apk',
        );

        if (!existsSync(apkPath)) {
            throw new Error(
                `The Android build succeeded but no APK was found at "${apkPath}".`,
            );
        }

        console.log(`Local test APK created: ${apkPath}`);
    } finally {
        if (originalAutolinkingConfig !== undefined) {
            await writeFile(
                autolinkingConfigPath,
                originalAutolinkingConfig,
                'utf8',
            );
        }

        if (isWindows) {
            if (gradleInitScriptCreated) {
                await unlink(gradleInitScript);
            }

            if (shortCmakeDrive) {
                removeShortWindowsPath(shortCmakeDrive);
            }

            if (shortRepositoryDrive) {
                removeShortWindowsPath(shortRepositoryDrive);
            }

            if (cmakeStagingDirectoryCreated) {
                await rm(cmakeStagingDirectory, {
                    force: true,
                    recursive: true,
                });
            }
        }
    }
}

buildLocalApk().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
