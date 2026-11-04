export const lightColors = {
    background: '#f4f5f7',
    surface: '#ffffff',
    surfaceMuted: '#e7eaee',
    border: '#d9dee5',
    text: '#171a1f',
    muted: '#535d68',
    primary: '#c85f00',
    primaryForeground: '#050505',
    primarySoft: '#fff0df',
    income: '#18794e',
    incomeSoft: '#e8f6ef',
    expense: '#d51f28',
    expenseSoft: '#fff0f0',
    warning: '#b45309',
    warningSoft: '#fff6e5',
    danger: '#535d68',
    backdrop: '#00000066',
};

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

export const darkColors: ThemeColors = {
    background: '#1b1f24',
    surface: '#232830',
    surfaceMuted: '#2e343c',
    border: '#2e343c',
    text: '#ffffff',
    muted: '#9aa3ae',
    primary: '#ff8500',
    primaryForeground: '#050505',
    primarySoft: '#382b20',
    income: '#2fcb7a',
    incomeSoft: '#20382e',
    expense: '#ff5c62',
    expenseSoft: '#3a252a',
    warning: '#f59e0b',
    warningSoft: '#392f21',
    danger: '#9aa3ae',
    backdrop: '#00000099',
};

export const spacing = {
    page: 20,
    card: 20,
};
