const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");

const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/", validateToken, async (req, res) => {
  const { sort } = req.query;
  let orderBy = [];

  // Determine the sorting order based on the query parameter
  switch (sort) {
    case "newest":
      orderBy.push(["createdAt", "DESC"]);
      break;
    case "oldest":
      orderBy.push(["createdAt", "ASC"]);
      break;
    case "most_likes":
      orderBy.push([Likes, "createdAt", "DESC"]);
      break;
    default:
      orderBy.push(["createdAt", "DESC"]); // Default to sorting by newest
      break;
  }

  const listOfPosts = await Posts.findAll({ include: [Likes], order: orderBy });
  const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
  
  res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  res.json(post);
});

router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id;
  const listOfPosts = await Posts.findAll({
    where: { UserId: id },
    include: [Likes],
  });
  res.json(listOfPosts);
});

router.post("/", validateToken, async (req, res) => {
  const post = req.body;
  post.username = req.user.username;
  post.UserId = req.user.id;
  await Posts.create(post);
  res.json(post);
});

router.put("/title", validateToken, async (req, res) => {
  const { newTitle, id } = req.body;
  await Posts.update({ title: newTitle }, { where: { id: id } });
  res.json(newTitle);
});

router.put("/postText", validateToken, async (req, res) => {
  const { newText, id } = req.body;
  await Posts.update({ postText: newText }, { where: { id: id } });
  res.json(newText);
});

router.delete("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  await Posts.destroy({
    where: {
      id: postId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});

module.exports = router;