'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@platform/db'
import { getServerUser } from '@/utils/serverAuth'
import { backendClient } from '@/utils/backendClient'
import { getServerAuthHeaders } from '@/utils/getServerAuthHeaders'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3010'

export async function updateProfile(data: { name: string; email: string; jobTitle?: string; image?: string }) {
    try {
        const user = await getServerUser()

        if (!user) throw new Error('Unauthorized')

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                email: data.email,
                jobTitle: data.jobTitle,
                image: data.image
            } as any
        })

        revalidatePath('/[locale]/admin/profile')

        return { success: true, data: updatedUser }
    } catch (error: any) {
        console.error('updateProfile error:', error)

        return { success: false, message: error.message }
    }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
        const user = await getServerUser()

        if (!user) throw new Error('Unauthorized')

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || !dbUser.password) {
            throw new Error('User not found or uses OAuth provider')
        }

        const isMatch = await bcrypt.compare(data.currentPassword, dbUser.password)

        if (!isMatch) {
            return { success: false, message: 'Incorrect current password' }
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return { success: true, message: 'Password updated successfully' }
    } catch (error: any) {
        console.error('changePassword error:', error)

        return { success: false, message: error.message }
    }
}

export async function getUserSessions() {
    try {
        const authHeaders = await getServerAuthHeaders()

        const response = await backendClient<{ sessions: any[] }>('/v1/auth/sessions', {
            baseUrl: AUTH_SERVICE_URL,
            method: 'GET',
            authorization: authHeaders.Authorization
        })

        return { success: true, data: response.sessions || [] }
    } catch (error: any) {
        console.error('getUserSessions error:', error)
        
return { success: false, message: error.message }
    }
}

export async function revokeSession(sessionId: string) {
    try {
        const authHeaders = await getServerAuthHeaders()

        await backendClient(`/v1/auth/sessions/${sessionId}`, {
            baseUrl: AUTH_SERVICE_URL,
            method: 'DELETE',
            authorization: authHeaders.Authorization
        })

        revalidatePath('/[locale]/admin/profile')
        
return { success: true }
    } catch (error: any) {
        console.error('revokeSession error:', error)
        
return { success: false, message: error.message }
    }
}

export async function setup2FA() {
    try {
        const authHeaders = await getServerAuthHeaders()

        const data = await backendClient('/v1/auth/2fa/setup', {
            baseUrl: AUTH_SERVICE_URL,
            method: 'POST',
            authorization: authHeaders.Authorization
        })

        return { success: true, data }
    } catch (error: any) {
        console.error('setup2FA error:', error)
        
return { success: false, message: error.message }
    }
}

export async function deactivateAccount() {
    try {
        const user = await getServerUser()

        if (!user) throw new Error('Unauthorized')

        // Mock deactivation logic: just log and return success
        console.log(`Deactivating account for user ${user.id}`)

        return { success: true, message: 'Account deactivated successfully. You will be logged out.' }
    } catch (error: any) {
        console.error('deactivateAccount error:', error)
        
return { success: false, message: error.message }
    }
}
