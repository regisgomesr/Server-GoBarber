import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';

import User from '@modules/users/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;
  avatarFilename: string;
}

class UpdateUserAvatarService {
  constructor(private usersRepository: IUsersRepository) {}

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      const userAVatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarFileExists = await fs.promises.stat(userAVatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAVatarFilePath);
      }
    }

    user.avatar = avatarFilename;

    await this.usersRepository.updateUser(user);

    return user;
  }
}

export default UpdateUserAvatarService;
