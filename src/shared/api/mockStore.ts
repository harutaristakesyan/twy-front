import type { User, UserFormData, UserRole } from '@/entities/user/types'

/**
 * Mock Data Store
 * Manages in-memory mock data for different entities
 */

class MockDataStore {
  private users: User[] = []
  private userIdCounter = 1

  constructor() {
    this.initializeUsers()
  }

  // Initialize with some default mock data
  private initializeUsers() {
    this.users = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: true,
        role: 'Owner' as UserRole,
        registeredDate: new Date().toISOString(),
        branchId: 'branch1',
        branchName: 'Main Branch'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        isActive: true,
        role: 'Head Accountant' as UserRole,
        registeredDate: new Date(Date.now() - 86400000).toISOString(),
        branchId: 'branch1',
        branchName: 'Main Branch'
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        isActive: false,
        role: 'Agent' as UserRole,
        registeredDate: new Date(Date.now() - 172800000).toISOString(),
        branchId: 'branch2',
        branchName: 'Secondary Branch'
      },
      {
        id: '4',
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        isActive: true,
        role: 'Carrier' as UserRole,
        registeredDate: new Date(Date.now() - 259200000).toISOString(),
        branchId: 'branch3',
        branchName: 'Regional Branch'
      },
      {
        id: '5',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        isActive: true,
        role: 'Head Owner' as UserRole,
        registeredDate: new Date(Date.now() - 345600000).toISOString(),
        branchId: 'branch1',
        branchName: 'Main Branch'
      },
      {
        id: '6',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@example.com',
        isActive: true,
        role: 'Accountant' as UserRole,
        registeredDate: new Date(Date.now() - 432000000).toISOString(),
        branchId: 'branch2',
        branchName: 'Secondary Branch'
      }
    ]
    this.userIdCounter = 7
  }

  // User CRUD operations with pagination and sorting
  getUsers(params?: {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: 'ascend' | 'descend'
    query?: string
  }) {
    const page = params?.page ?? 0
    const limit = params?.limit ?? 5
    const sortField = params?.sortField ?? 'createdAt'
    const sortOrder = params?.sortOrder ?? 'descend'
    const query = params?.query?.toLowerCase() ?? ''

    console.log('📋 Getting users from mock store with params:', params)

    // Filter by search query
    let filteredUsers = [...this.users]
    if (query) {
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'firstName':
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
          break
        case 'lastName':
          aValue = a.lastName.toLowerCase()
          bValue = b.lastName.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'isActive':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'branch':
          aValue = a.branchName?.toLowerCase() ?? ''
          bValue = b.branchName?.toLowerCase() ?? ''
          break
        case 'createdAt':
        default:
          aValue = new Date(a.registeredDate).getTime()
          bValue = new Date(b.registeredDate).getTime()
          break
      }

      if (aValue < bValue) return sortOrder === 'ascend' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'ascend' ? 1 : -1
      return 0
    })

    // Paginate
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    console.log(`📊 Returning ${paginatedUsers.length} users (page ${page + 1}/${totalPages}, total: ${total})`)

    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages
    }
  }

  // Get all users without pagination (for backward compatibility)
  getAllUsers(): User[] {
    return [...this.users]
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id)
  }

  createUser(data: UserFormData): User {
    const newUser: User = {
      id: String(this.userIdCounter++),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isActive: data.isActive,
      role: data.role,
      registeredDate: new Date().toISOString(),
      branchId: data.branchId,
      branchName: this.getBranchName(data.branchId)
    }
    this.users.push(newUser)
    console.log('✅ User added to mock store:', newUser)
    console.log('📊 Total users in store:', this.users.length)
    return newUser
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return null

    this.users[index] = {
      ...this.users[index],
      ...data,
      id, // Ensure id doesn't change
      branchName: data.branchId ? this.getBranchName(data.branchId) : this.users[index].branchName
    }
    return this.users[index]
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return false
    
    this.users.splice(index, 1)
    return true
  }

  // Helper method to get branch name
  private getBranchName(branchId: string): string {
    const branchMap: Record<string, string> = {
      'branch1': 'Main Branch',
      'branch2': 'Secondary Branch',
      'branch3': 'Regional Branch'
    }
    return branchMap[branchId] || 'Unknown Branch'
  }

  // Reset all data (useful for testing)
  reset() {
    this.initializeUsers()
  }
}

// Export a singleton instance
export const mockStore = new MockDataStore()

