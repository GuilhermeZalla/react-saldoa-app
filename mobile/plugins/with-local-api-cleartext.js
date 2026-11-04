const {
    withAndroidManifest,
    withDangerousMod,
} = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');
const { isIPv4 } = require('node:net');

const NETWORK_CONFIG_NAME = 'saldoa_local_api_network_security_config';
const NETWORK_CONFIG_REFERENCE = `@xml/${NETWORK_CONFIG_NAME}`;

function getLocalApiHost(apiUrl) {
    let url;

    try {
        url = new URL(apiUrl);
    } catch (error) {
        throw new Error(
            'EXPO_PUBLIC_API_URL must be a valid private HTTP URL for a local APK.',
            { cause: error },
        );
    }

    if (url.protocol !== 'http:') {
        throw new Error(
            'The local APK build accepts only a private HTTP API URL. Use a regular Android build for HTTPS.',
        );
    }

    const host = url.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isAndroidEmulatorHost = host === '10.0.2.2';
    const isPrivateIpv4 =
        isIPv4(host) &&
        /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/.test(
            host,
        );

    if (!isLocalHost && !isAndroidEmulatorHost && !isPrivateIpv4) {
        throw new Error(
            'The local APK build only allows localhost, the Android Emulator host, or a private IPv4 API address.',
        );
    }

    return host;
}

function withLocalApiCleartext(config) {
    const isLocalBuild = process.env.SALDOA_LOCAL_APK === 'true';
    const localApiHost = isLocalBuild
        ? getLocalApiHost(process.env.EXPO_PUBLIC_API_URL ?? '')
        : null;

    config = withAndroidManifest(config, (modConfig) => {
        const application = modConfig.modResults.manifest.application?.[0];

        if (!application) {
            throw new Error(
                'The Android manifest does not declare an application.',
            );
        }

        if (isLocalBuild) {
            application.$['android:networkSecurityConfig'] =
                NETWORK_CONFIG_REFERENCE;
        } else if (
            application.$['android:networkSecurityConfig'] ===
            NETWORK_CONFIG_REFERENCE
        ) {
            delete application.$['android:networkSecurityConfig'];
        }

        return modConfig;
    });

    return withDangerousMod(config, [
        'android',
        async (modConfig) => {
            const resourceDirectory = path.join(
                modConfig.modRequest.platformProjectRoot,
                'app',
                'src',
                'main',
                'res',
                'xml',
            );
            const resourcePath = path.join(
                resourceDirectory,
                `${NETWORK_CONFIG_NAME}.xml`,
            );

            if (!isLocalBuild) {
                await fs.rm(resourcePath, { force: true });

                return modConfig;
            }

            await fs.mkdir(resourceDirectory, { recursive: true });
            await fs.writeFile(
                resourcePath,
                [
                    '<?xml version="1.0" encoding="utf-8"?>',
                    '<network-security-config>',
                    '    <base-config cleartextTrafficPermitted="false" />',
                    '    <domain-config cleartextTrafficPermitted="true">',
                    `        <domain includeSubdomains="false">${localApiHost}</domain>`,
                    '    </domain-config>',
                    '</network-security-config>',
                    '',
                ].join('\n'),
                'utf8',
            );

            return modConfig;
        },
    ]);
}

module.exports = withLocalApiCleartext;
