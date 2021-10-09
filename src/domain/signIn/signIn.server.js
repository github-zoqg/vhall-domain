import contextServer from '@/domain/context.server.js'

export default function useSignInServer() {
    const state = {
    }

    return { state, updateSignIn }
}