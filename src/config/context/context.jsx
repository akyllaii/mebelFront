import {createContext, useEffect, useState} from 'react'
import api from "../api/api";
import {useNavigate} from 'react-router-dom'

export const CustomContext = createContext()

const Context = (props) => {

    const [user,setUser] = useState({email: ''})
    const [hitSale, setHitSale] = useState([])
    const [favorites,setFavorites] = useState([])
    const [search,setSearch] = useState('')
    const [isLoading,setIsLoading] = useState(true)
    const navigate = useNavigate()

    const logOutUser = () => {
        setUser({email: ''})
        localStorage.removeItem('user')
        navigate('/')
    }


    const favoritesHandler = (product) => {
        let findProduct = favorites.some(item => item.id === product.id)
        if (findProduct) {
            setFavorites(prev => prev.filter(item => item.id !== product.id))
        } else{
            setFavorites(prev => [...prev,product])
        }
    }
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
        if (localStorage.getItem('user') !== null) {
            setUser(JSON.parse(localStorage.getItem('user')))
        }
        if (localStorage.getItem('favorites') !== null) {
            setFavorites(JSON.parse(localStorage.getItem('favorites')))
        }
    },[])

    const registerUser = (user) => {
        api.post('register', {
            headers: {
                "content-type" : "application/json"
            },
            json: {
                ...user,
                point: 0,
                orders: [],
                carts: [],
                city: '',
                home: '',
                street: ''
            }
        }).json().then((res) => {
            setUser(res.user)
            navigate('/')
            localStorage.setItem('user', JSON.stringify(res.user))
        })
    }
    const loginUser = (user) => {
        api.post('login', {
            headers: {
                "content-type" : "application/json"
            },
            json: {
                ...user
            }
        }).json().then((res) => {
            setUser(res.user)
            navigate('/')
            localStorage.setItem('user', JSON.stringify(res.user))
        })
    }
    const getHitSale = () => {
        api('products?_sort=sale&_order=desc&_limit=12').json()
            .then((res) =>
                {
                    setHitSale(res)
                    setIsLoading(false)
                })
    }
    const addCarts = (product) => {
        api.patch(`users/${user.id}`,{
            headers: {
                "content-type" : "application/json"
            },
            json: {
                carts: [...user.carts,{...product,count:1}]
            }
        }).json().then((res) => {
            setUser(res)
            localStorage.setItem('user', JSON.stringify(res))
        })
    }
    const addCartsPlus = (id) => {
        api.patch(`users/${user.id}`,{
            headers: {
                "content-type" : "application/json"
            },
            json: {
                carts: user.carts.map(item => {
                    if (item.id === id) {
                        return {...item, count: item.count + 1}
                    }
                    return item
                })
            }
        }).json().then((res) => {
            setUser(res)
            localStorage.setItem('user', JSON.stringify(res))
        })
    }
    const removeCartsMinus = (id) => {
        api.patch(`users/${user.id}`,{
            headers: {
                "content-type" : "application/json"
            },
            json: {
                carts: user.carts.find(item => item.id === id).count > 1 ? user.carts.map(item => {
                    if (item.id === id) {
                        return {...item, count: item.count - 1}
                    }
                    return item
                }) : user.carts.filter((item) => item.id !== id)
            }
        }).json().then((res) => {
            setUser(res)
            localStorage.setItem('user', JSON.stringify(res))
        })
    }

    const addOrder = (order,setPopup,redirect) => {
        api.patch(`users/${user.id}`,{
            headers: {
                "content-type" : "application/json"
            },
            json: {
                point: Math.floor(user.point + (order.totalPrice * 0.7)),
                orders: [...user.orders, order],
                carts: []
            }
        }).json().then((res) => {
            setUser(res)
            localStorage.setItem('user', JSON.stringify(res))
            setPopup(true)
            redirect()
        })
    }

    let value = {
        user,setUser, registerUser, loginUser, logOutUser, hitSale, getHitSale, favoritesHandler, favorites, search, setSearch,
        addCarts,addCartsPlus, removeCartsMinus,addOrder,isLoading,setIsLoading
    }

    return <CustomContext.Provider value={value}>
        {
            props.children
        }
    </CustomContext.Provider>
}

export default Context