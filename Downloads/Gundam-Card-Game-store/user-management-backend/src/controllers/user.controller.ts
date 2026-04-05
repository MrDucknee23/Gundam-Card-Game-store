import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { formatResponse } from '../utils/response.util';

class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const users = await UserService.getUsers({ page, limit, search, role, status });
      res.status(200).json(formatResponse(true, users, 'Users retrieved successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId as string);
      if (!user) {
        return res.status(404).json(formatResponse(false, null, 'User not found'));
      }
      res.status(200).json(formatResponse(true, user, 'User retrieved successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const newUser = await UserService.createUser(req.body);
      res.status(201).json(formatResponse(true, newUser, 'User created successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updatedUser = await UserService.updateUser(userId as string, req.body);
      if (!updatedUser) {
        return res.status(404).json(formatResponse(false, null, 'User not found'));
      }
      res.status(200).json(formatResponse(true, updatedUser, 'User updated successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const deletedUser = await UserService.deleteUser(userId as string);
      if (!deletedUser) {
        return res.status(404).json(formatResponse(false, null, 'User not found'));
      }
      res.status(200).json(formatResponse(true, null, 'User deleted successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async blockUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const blockedUser = await UserService.blockUser(userId as string);
      if (!blockedUser) {
        return res.status(404).json(formatResponse(false, null, 'User not found'));
      }
      res.status(200).json(formatResponse(true, blockedUser, 'User blocked successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async unblockUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const unblockedUser = await UserService.unblockUser(userId as string);
      if (!unblockedUser) {
        return res.status(404).json(formatResponse(false, null, 'User not found'));
      }
      res.status(200).json(formatResponse(true, unblockedUser, 'User unblocked successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await UserService.getUserStats();
      res.status(200).json(formatResponse(true, stats, 'User stats retrieved successfully'));
    } catch (error) {
      res.status(500).json(formatResponse(false, null, (error as Error).message));
    }
  }
}

export default new UserController();