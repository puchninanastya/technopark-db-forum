import usersModel from '../models/users-model';

export default new class UsersController {

    async createUser(req, res) {
        let nickname = req.params['nickname'];
        let userData = req.body;

        let existingUser = await usersModel.getUser(nickname);
        console.log('get user res:', existingUser);

        if (existingUser) {
            console.log('in if already exist');
            return res.status(409).json(existingUser);
        }

        console.log('user not found');
        let createdUser = await usersModel.createUser(nickname, userData);
        console.log('user created', createdUser);
        res.status(201).json(createdUser);
    }

    async getUser(req, res) {
        let nickname = req.params['nickname'];

        let existingUser = await usersModel.getUser(nickname);
        console.log('get user res:', existingUser);

        if (!existingUser) {
            console.log('user not found');
            return res.status(404).json({ message: "Can't find user with nickname " + nickname });
        }

        console.log('in 200');
        res.json(existingUser);
    }
}