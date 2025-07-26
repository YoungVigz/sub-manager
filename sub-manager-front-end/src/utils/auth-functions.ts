export function getAuthTokenFromCookie(): string | null {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('JWT='));

    return cookie ? cookie.split('=')[1] : null;
}

export function getUsernameFromCookie(): string | null {
    const token = getAuthTokenFromCookie()
    if (!token) return null

    try {
        const payloadBase64 = token.split('.')[1]
        const payloadJson = atob(payloadBase64)
        const payload = JSON.parse(payloadJson)

        return payload.sub || null
    } catch (error) {
        console.error("Error while decoding JWT:", error)
        return null
    }
}

export function logout() {
    document.cookie = "JWT=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.reload();
}