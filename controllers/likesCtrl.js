const likeModel = require("../models/likesModel");
const postModel = require("../models/postModel");

const likedPost = async (req, res) => {
  try {
    const body = req.body;
    const { postId, userId } = req.body;
    const response = await postModel.findByIdAndUpdate(postId, {
      $addToSet: {
        likes: userId,
      },
    });
    res.send(response);
  } catch (error) {
    console.log(error);
  }
};
const disLike = async (req, res) => {
  try {
    const { likeId, postId } = req.body;
    await postModel.findByIdAndUpdate(postId, {
      $pull: {
        likes: likeId,
      },
    });
    res.send("dislike success");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { likedPost, disLike };
