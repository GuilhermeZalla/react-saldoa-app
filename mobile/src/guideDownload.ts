import { Platform } from 'react-native';
import type { Locale } from './i18n';

export async function downloadGuide(
    webUrl: string,
    language: Locale,
): Promise<'saved' | 'started' | 'cancelled'> {
    const url = `${webUrl.replace(/\/+$/, '')}/guide?lang=${language}`;
    const filename =
        language === 'en'
            ? 'use-guide-saldoa-en.pdf'
            : 'guia-de-uso-saldoa.pdf';

    if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return 'started';
    }

    const { Directory, File, Paths } = await import('expo-file-system');
    let directory;
    try {
        directory = await Directory.pickDirectoryAsync();
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ERR_PICKER_CANCELLED'
        ) {
            return 'cancelled';
        }
        throw error;
    }

    const temporaryFile = new File(
        Paths.cache,
        `saldoa-guide-${Date.now()}.pdf`,
    );
    let destination: InstanceType<typeof File> | undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
        await File.downloadFileAsync(url, temporaryFile, {
            signal: controller.signal,
        });
        const bytes = await temporaryFile.bytes();
        if (
            bytes[0] !== 0x25 ||
            bytes[1] !== 0x50 ||
            bytes[2] !== 0x44 ||
            bytes[3] !== 0x46 ||
            bytes[4] !== 0x2d
        ) {
            throw new Error('The guide response is not a PDF');
        }
        destination = directory.createFile(filename, 'application/pdf');
        await destination.write(bytes);
        return 'saved';
    } catch (error) {
        try {
            if (destination?.exists) destination.delete();
        } catch {
            /* Keep the original download or save error. */
        }
        throw error;
    } finally {
        clearTimeout(timeout);
        try {
            if (temporaryFile.exists) temporaryFile.delete();
        } catch {
            /* A cache cleanup failure must not report a saved guide as failed. */
        }
    }
}
