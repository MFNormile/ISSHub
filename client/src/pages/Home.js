import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import { AuthContext } from "../helpers/AuthContext";

function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);
  const history = useHistory();
  const [sortBy, setSortBy] = useState("newest"); // State to track sorting option

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    } else {
      axios
        .get("http://localhost:3001/posts", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          setListOfPosts(response.data.listOfPosts);
          setLikedPosts(
            response.data.likedPosts.map((like) => like.PostId)
          );
        });
    }
  }, []);

  const likeAPost = (postId) => {
    axios
      .post(
        "http://localhost:3001/likes",
        { PostId: postId },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        setListOfPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  Likes: response.data.liked
                    ? [...post.Likes, 0]
                    : post.Likes.slice(0, -1),
                }
              : post
          )
        );

        setLikedPosts((prevLikedPosts) =>
          response.data.liked
            ? [...prevLikedPosts, postId]
            : prevLikedPosts.filter((id) => id !== postId)
        );
      });
  };

  // Function to sort posts based on the selected option
  const sortPosts = (option) => {
    let sortedPosts = [...listOfPosts];
    if (option === "newest") {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === "oldest") {
      sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (option === "mostLikes") {
      sortedPosts.sort((a, b) => b.Likes.length - a.Likes.length);
    }
    setListOfPosts(sortedPosts);
  };

  return (
    <div>
      {/* Sorting buttons */}
      <div>
        <button onClick={() => sortPosts("newest")}>Sort by Newest</button>
        <button onClick={() => sortPosts("oldest")}>Sort by Oldest</button>
        <button onClick={() => sortPosts("mostLikes")}>
          Sort by Most Likes
        </button>
      </div>

      {/* List of posts */}
      {listOfPosts.map((value, key) => (
        <div key={key} className="post">
          <div className="title">{value.title}</div>
          <div
            className="body"
            onClick={() => {
              history.push(`/post/${value.id}`);
            }}
          >
            {value.postText}
          </div>
          <div className="footer">
            <div className="username">
              <Link to={`/profile/${value.UserId}`}>{value.username}</Link>
            </div>
            <div className="buttons">
              <ThumbUpAltIcon
                onClick={() => likeAPost(value.id)}
                className={likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"}
              />
              <label>{value.Likes.length}</label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;