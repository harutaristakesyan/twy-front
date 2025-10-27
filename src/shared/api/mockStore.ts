import type { User, UserFormData, UserRole } from '@/entities/user/types'
import type { Branch, BranchFormData } from '@/entities/branch/types'

/**
 * Mock Data Store
 * Manages in-memory mock data for different entities
 */

class MockDataStore {
  private users: User[] = []
  private userIdCounter = 1
  private branches: Branch[] = []
  private branchIdCounter = 1

  constructor() {
    this.initializeBranches()
    this.initializeUsers()
  }

  // Initialize branch mock data
  private initializeBranches() {
    this.branches = [
      {
        id: 'branch1',
        name: 'Main Store',
        contact: '1-555-1234',
        owner: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'branch2',
        name: 'West Side',
        contact: null,
        owner: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'branch3',
        name: 'East Branch',
        contact: '1-555-5678',
        owner: {
          id: '5',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com'
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    this.branchIdCounter = 4
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
      branchId: data.branch, // For backward compatibility
      branchName: this.getBranchName(data.branch)
    }
    this.users.push(newUser)
    console.log('✅ User added to mock store:', newUser)
    console.log('📊 Total users in store:', this.users.length)
    return newUser
  }

  updateUser(id: string, data: any): User | null {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return null

    // Handle branch field (new) and branchId (legacy) for backward compatibility
    const branchId = data.branch || data.branchId
    
    this.users[index] = {
      ...this.users[index],
      ...data,
      id, // Ensure id doesn't change
      branchId: branchId || this.users[index].branchId,
      branchName: branchId ? this.getBranchName(branchId) : this.users[index].branchName
    }
    
    // Remove the 'branch' field if it exists (it's sent in request but not stored)
    if ('branch' in this.users[index]) {
      delete (this.users[index] as any).branch
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
    const branch = this.branches.find(b => b.id === branchId)
    return branch?.name || 'Unknown Branch'
  }

  // Branch CRUD operations with pagination and sorting
  getBranches(params?: {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: 'ascend' | 'descend'
    query?: string
  }) {
    const page = params?.page ?? 0
    const limit = params?.limit ?? 10
    const sortField = params?.sortField ?? 'createdAt'
    const sortOrder = params?.sortOrder ?? 'descend'
    const query = params?.query?.toLowerCase() ?? ''

    console.log('📋 Getting branches from mock store with params:', params)

    // Filter by search query
    let filteredBranches = [...this.branches]
    if (query) {
      filteredBranches = filteredBranches.filter(branch =>
        branch.name.toLowerCase().includes(query) ||
        (branch.contact && branch.contact.toLowerCase().includes(query)) ||
        (branch.owner && `${branch.owner.firstName} ${branch.owner.lastName}`.toLowerCase().includes(query))
      )
    }

    // Sort branches
    filteredBranches.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'owner':
          aValue = a.owner ? `${a.owner.firstName} ${a.owner.lastName}`.toLowerCase() : ''
          bValue = b.owner ? `${b.owner.firstName} ${b.owner.lastName}`.toLowerCase() : ''
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0).getTime()
          bValue = new Date(b.createdAt || 0).getTime()
          break
      }

      if (aValue < bValue) return sortOrder === 'ascend' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'ascend' ? 1 : -1
      return 0
    })

    // Paginate
    const total = filteredBranches.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedBranches = filteredBranches.slice(startIndex, endIndex)

    console.log(`📊 Returning ${paginatedBranches.length} branches (page ${page + 1}/${totalPages}, total: ${total})`)

    return {
      branches: paginatedBranches,
      total
    }
  }

  getBranchById(id: string): Branch | undefined {
    return this.branches.find(branch => branch.id === id)
  }

  createBranch(data: BranchFormData): Branch {
    // Check for duplicate branch name
    const existingBranch = this.branches.find(
      b => b.name.toLowerCase() === data.name.toLowerCase()
    )
    
    if (existingBranch) {
      const error = new Error('duplicate key value violates unique constraint "branch_name_key"')
      ;(error as any).response = {
        data: {
          error: 'duplicate key value violates unique constraint "branch_name_key"'
        }
      }
      throw error
    }
    
    // Get owner details from users (owner is required)
    const owner = this.users.find(u => u.id === data.owner)
    
    if (!owner) {
      throw new Error('Owner not found')
    }
    
    const ownerData = {
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email
    }

    const newBranch: Branch = {
      id: `branch${this.branchIdCounter++}`,
      name: data.name,
      contact: data.contact || null,
      owner: ownerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.branches.push(newBranch)
    console.log('✅ Branch added to mock store:', newBranch)
    console.log('📊 Total branches in store:', this.branches.length)
    return newBranch
  }

  updateBranch(id: string, data: Partial<BranchFormData>): Branch | null {
    const index = this.branches.findIndex(branch => branch.id === id)
    if (index === -1) return null

    const branch = this.branches[index]
    
    // Check for duplicate branch name (if name is being updated)
    if (data.name !== undefined) {
      const existingBranch = this.branches.find(
        b => b.id !== id && b.name.toLowerCase() === data.name.toLowerCase()
      )
      
      if (existingBranch) {
        const error = new Error('duplicate key value violates unique constraint "branch_name_key"')
        ;(error as any).response = {
          data: {
            error: 'duplicate key value violates unique constraint "branch_name_key"'
          }
        }
        throw error
      }
    }
    
    let ownerData = branch.owner

    // Update owner if provided
    if (data.owner !== undefined) {
      if (data.owner) {
        const owner = this.users.find(u => u.id === data.owner)
        if (owner) {
          ownerData = {
            id: owner.id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email
          }
        }
      } else {
        ownerData = null
      }
    }

    this.branches[index] = {
      ...branch,
      name: data.name !== undefined ? data.name : branch.name,
      contact: data.contact !== undefined ? (data.contact || null) : branch.contact,
      owner: ownerData,
      updatedAt: new Date().toISOString()
    }

    console.log('✅ Branch updated in mock store:', this.branches[index])
    return this.branches[index]
  }

  deleteBranch(id: string): boolean {
    const index = this.branches.findIndex(branch => branch.id === id)
    if (index === -1) return false
    
    this.branches.splice(index, 1)
    console.log('✅ Branch deleted from mock store, ID:', id)
    console.log('📊 Total branches in store:', this.branches.length)
    return true
  }

  // Reset all data (useful for testing)
  reset() {
    this.initializeBranches()
    this.initializeUsers()
  }
}

// Export a singleton instance
export const mockStore = new MockDataStore()

