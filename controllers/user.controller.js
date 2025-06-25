import User from '../models/user.model.js';

export async function getAllUsers(req, res) {
  const users = await find();
  res.json(users);
}

export async function createUser(req, res) {
  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json(newUser);
}
