import { IUserRepository, UserEntity } from '../../lib/server/repositories/user.repository';

export class MockUserRepository implements IUserRepository {
  private users = new Map<string, UserEntity>();

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const user: UserEntity = {
      id: `u-mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, data: Partial<Omit<UserEntity, 'id' | 'createdAt'>>): Promise<UserEntity> {
    const existing = this.users.get(id);
    if (!existing) throw new Error(`User ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return Array.from(this.users.values()).find((u) => u.email === email) || null;
  }

  async findByRole(role: UserEntity['role']): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  async findByDepartment(departmentId: string): Promise<UserEntity[]> {
    return Array.from(this.users.values()).filter((u) => u.departmentId === departmentId);
  }

  async updateLastLogin(id: string, timestamp: Date): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = timestamp;
    }
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isActive = isActive;
    }
  }
}
