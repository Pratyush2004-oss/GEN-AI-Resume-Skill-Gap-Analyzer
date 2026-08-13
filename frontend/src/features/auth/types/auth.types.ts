export type UserType = {
    username: string,
    _id: string,
    email: string
}

export type AuthResponseType = {
    user: UserType,
    message: string,
    accessToken: string
}

export type RefreshResponseType = {
    accessToken: string
}

export type CheckMeResponseType = {
    user: UserType
}

export type LogoutResponseType = {
    message: string
}