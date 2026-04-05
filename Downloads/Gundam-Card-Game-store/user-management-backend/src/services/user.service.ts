import User from '../models/user.model';

export class UserService {
    static async getUsers(query: any) {
        const { page = 1, limit = 10, search, role, status } = query;
        const filters: any = {};

        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            filters.role = role;
        }

        if (status) {
            filters.status = status;
        }

        const users = await User.find(filters)
            .skip((page - 1) * limit)
            .limit(limit);
        const totalUsers = await User.countDocuments(filters);

        return {
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        };
    }

    static async getUserById(id: string) {
        return await User.findById(id);
    }

    static async createUser(data: any) {
        const user = new User(data);
        return await user.save();
    }

    static async updateUser(id: string, data: any) {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteUser(id: string) {
        return await User.findByIdAndDelete(id);
    }

    static async blockUser(id: string) {
        return await User.findByIdAndUpdate(id, { status: 'blocked' }, { new: true });
    }

    static async unblockUser(id: string) {
        return await User.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    }

    static async getUserStats() {
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const activeUsers = await User.countDocuments({ status: 'active' });

        return {
            totalUsers,
            totalCustomers,
            totalAdmins,
            activeUsers,
        };
    }
}