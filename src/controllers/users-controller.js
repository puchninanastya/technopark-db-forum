import usersModel from '../models/users-model';

export default new class UsersController {

    async createUser(req, res) {
        let nickname = req.params['nickname'];
        let userData = req.body;

        let existingUser = await usersModel.getUsersByNicknameOrEmail(nickname, userData.email);
        if (existingUser.length > 0) {
            return res.status(409).json(existingUser);
        }

        let result = await usersModel.createUser(nickname, userData);
        if (result.isSuccess) {
            res.status(201).json(result.data);
        } else {
            res.status(500).end();
        }
    }

    async getUser(req, res) {
        let nickname = req.params['nickname'];

        let existingUser = await usersModel.getUserByNickname(nickname);
        if (!existingUser) {
            return res.status(404).json({ message: "Can't find user with nickname " + nickname });
        }

        res.json(existingUser);
    }

    async updateUser(req, res) {
        let nickname = req.params['nickname'];
        let userData = req.body;

        let existingUser = await usersModel.getUserByNickname(nickname);

        if (!existingUser) {
            return res.status(404).json({ message: "Can't find user with nickname " + nickname });
        }

        let updatedUser = await usersModel.updateUser(nickname, userData);
        if (!updatedUser) {
            return res.status(409).json({ message: "Can't change user with nickname " + nickname });
        }

        if (updatedUser === true) {
            res.json(existingUser);
        } else {
            res.json(updatedUser);
        }

    }
}