import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "https://hopeful-desire-21262e95c7.strapiapp.com/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingArticleId, setEditingArticleId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
      fetchArticles(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchArticles = async (token) => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setArticles(data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchUser(data.jwt);
        fetchArticles(data.jwt);
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchUser(data.jwt);
        fetchArticles(data.jwt);
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setArticles([]);
    toast({
      title: "Logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const createArticle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
          },
        }),
      });
      const data = await response.json();
      setArticles([...articles, data.data]);
      setTitle("");
      setDescription("");
      toast({
        title: "Article created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating article:", error);
    }
  };

  const updateArticle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/articles/${editingArticleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
          },
        }),
      });
      const data = await response.json();
      const updatedArticles = articles.map((article) => (article.id === editingArticleId ? data.data : article));
      setArticles(updatedArticles);
      setTitle("");
      setDescription("");
      setEditingArticleId(null);
      toast({
        title: "Article updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  const deleteArticle = async (articleId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedArticles = articles.filter((article) => article.id !== articleId);
      setArticles(updatedArticles);
      toast({
        title: "Article deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Article Management
      </Heading>
      {isLoggedIn ? (
        <>
          <Text mb={4}>Welcome, {user?.username}!</Text>
          <Stack spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            <Button colorScheme="blue" onClick={editingArticleId ? updateArticle : createArticle}>
              {editingArticleId ? "Update Article" : "Create Article"}
            </Button>
          </Stack>
          <Stack spacing={4}>
            {articles.map((article) => (
              <Box key={article.id} p={4} borderWidth={1} borderRadius="md">
                <Heading as="h2" size="md" mb={2}>
                  {article.attributes.title}
                </Heading>
                <Text mb={2}>{article.attributes.description}</Text>
                <Stack direction="row" spacing={2}>
                  <Button
                    leftIcon={<FaEdit />}
                    size="sm"
                    onClick={() => {
                      setTitle(article.attributes.title);
                      setDescription(article.attributes.description);
                      setEditingArticleId(article.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} size="sm" colorScheme="red" onClick={() => deleteArticle(article.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
          <Button mt={4} onClick={logout}>
            Logout
          </Button>
        </>
      ) : (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" onChange={(e) => setUser({ ...user, username: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" onChange={(e) => setUser({ ...user, password: e.target.value })} />
          </FormControl>
          <Stack direction="row" spacing={4}>
            <Button colorScheme="blue" onClick={() => register(user.email, user.username, user.password)}>
              Register
            </Button>
            <Button onClick={() => login(user.email || user.username, user.password)}>Login</Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default Index;
