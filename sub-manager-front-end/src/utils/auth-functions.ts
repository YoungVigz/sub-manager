export function getAuthTokenFromCookie() {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('JWT='));

    return cookie ? cookie.split('=')[1] : null;
}