const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signupUser = async (req, res) => {
  try {
    const body = req.body;
    const { username, password, email, proImg } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      password: hashedPassword,
      email,
      proImg,
    };
    const response = await userModel.create(newUser);
    const token = jwt.sign(
      {
        userId: response._id,
        username: response.username,
        email: response.email,
        password: response.password,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );
    res.status(200).send({ token });
  } catch (error) {
    res.status(404).send("Sign up error");
  }
};
const loginUser = async (req, res) => {
  try {
    const body = req.body;
    const { username, password } = body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json("Username not found");
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(404).json("Incorrect email and password combination");
    }
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).send("Log in error");
  }
};
const getUser = async (req, res) => {
  try {
    const Posts = await userModel.find().populate("posts", "caption postImg");
    res.send(Posts);
  } catch (error) {
    console.log(error);
  }
};

const followUsers = async (req, res) => {
  const { followersId, followingId } = req.body;
  if (await userModel.findOne({ followers: followingId }))
    res.send("already followed");
  try {
    await userModel.findByIdAndUpdate(followersId, {
      $addToSet: {
        followers: followingId,
      },
    });
    await userModel.findByIdAndUpdate(followingId, {
      $addToSet: {
        following: followersId,
      },
    });
    res.send("Done");
  } catch (error) {
    console.log(error);
  }
};

const unFollowUser = async (req, res) => {
  const { followersId, followingId } = req.body;
  const checkFollower = await userModel.findOne({ followers: followingId });
  if (checkFollower) {
    await userModel.findByIdAndUpdate(followersId, {
      $pull: {
        followers: followingId,
      },
    });
    await userModel.findByIdAndUpdate(followingId, {
      $pull: {
        following: followersId,
      },
    });
    res.send(`Deleted `);
  }
};

const getUserPosts = async (req, res) => {
  const { userId } = req.body;
  try {
    const posts = await userModel.findOne({ _id: userId }).populate([
      {
        path: "posts",
        populate: [
          { path: "likes", select: "username proImg" },
          {
            path: "comments",
            select: "comment userId",
            populate: {
              path: "userId",
              select: "username proImg",
            },
          },
        ],
      },
    ]);
    res.send(posts);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUser,
  followUsers,
  unFollowUser,
  getUserPosts,
};
