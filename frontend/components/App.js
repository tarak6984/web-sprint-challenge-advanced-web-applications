import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/') }
  const redirectToArticles = () => { navigate('/articles') }

  const logout = () => {
    localStorage.removeItem('token')
    setMessage('Goodbye!')
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    setMessage('')
    setSpinnerOn(true)
    fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('token', data.token)
        setMessage(data.message)
        redirectToArticles()
      })
      .catch(err => {
        setMessage(err.message)
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  const getArticles = () => {
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    fetch(articlesUrl, {
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (res.status === 401) {
          redirectToLogin()
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then(data => {
        setArticles(data.articles)
        setMessage(data.message)
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          setMessage(err.message)
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  const postArticle = article => {
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    fetch(articlesUrl, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    })
      .then(res => {
        if (res.status === 401) {
          redirectToLogin()
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then(data => {
        setArticles([...articles, data.article])
        setMessage(data.message)
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          setMessage(err.message)
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  const updateArticle = ({ article_id, article }) => {
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    })
      .then(res => {
        if (res.status === 401) {
          redirectToLogin()
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then(data => {
        setArticles(articles.map(art => art.article_id === article_id ? data.article : art))
        setMessage(data.message)
        setCurrentArticleId(null)
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          setMessage(err.message)
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  const deleteArticle = article_id => {
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (res.status === 401) {
          redirectToLogin()
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then(data => {
        setArticles(articles.filter(art => art.article_id !== article_id))
        setMessage(data.message)
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          setMessage(err.message)
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm 
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticle={articles.find(art => art.article_id === currentArticleId)}
              />
              <Articles 
                articles={articles}
                getArticles={getArticles}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticleId={currentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
