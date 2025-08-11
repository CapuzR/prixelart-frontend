import { PrixResponse } from "types/prixResponse.types"
import { User } from "types/user.types"
import axios from "axios"

export const createUser = async (data: User): Promise<PrixResponse> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/user/create"
  try {
    const response = await axios.post<PrixResponse>(base_url, data, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const newUser = response.data as unknown as PrixResponse
    return newUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

interface RequestOptions {
  signal?: AbortSignal
}

export const getUserById = async (
  id: string,
  options: RequestOptions = {}
): Promise<User> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/user/read/${id}`
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
      signal: options.signal,
    })
    if (!response.data.success) {
      console.error(
        `Backend reported failure fetching user '${id}':`,
        response.data.message
      )
      throw new Error(response.data.message || `Failed to fetch user '${id}'`)
    }
    const role = response.data.result as unknown as User
    return role
  } catch (error) {
    console.error(`Error fetching user by ID '${id}':`, error)
    throw error
  }
}

export const getUsersByIds = async (ids: string[]): Promise<User[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/users/by-ids"
  try {
    const response = await axios.post<PrixResponse>(
      base_url,
      { ids: ids },
      { withCredentials: true }
    )

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const users = response.data.result as unknown as User[]
    return users
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const getUsers = async (): Promise<User[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/user/read-all"
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const users = response.data.result as unknown as User[]
    return users
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/user/update/${id}`
  try {
    const response = await axios.put<PrixResponse>(base_url, userData, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating user '${userData.username}':`,
        response.data.message
      )
      throw new Error(
        response.data.message || `Failed to update user '${userData.username}'`
      )
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no user data returned after update for '${userData.username}'.`
      )
      throw new Error(
        `No data received after updating user '${userData.username}'.`
      )
    }

    const updatedUser = response.data.result as unknown as User
    return updatedUser
  } catch (error) {
    console.error(`Error updating user '${userData.username}':`, error)
    throw error
  }
}

export const deleteUser = async (username: string): Promise<User> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/user/delete/" + username
  try {
    const response = await axios.delete(base_url, { withCredentials: true })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const delUser = response.data.result as unknown as User
    return delUser
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const getBalance = async (_id: string, options: RequestOptions = {}) => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/account/readById/${_id}`
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
      signal: options.signal,
    })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }
    return (response?.data?.result as { balance: number }).balance
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const createWallet = async (email: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/account/create"
  try {
    const response = await axios.post(base_url,{email: email})

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    } else return response
  } catch (error) {
    console.log(error)
    throw error
  }
}
