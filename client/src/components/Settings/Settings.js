import React from 'react'
import styles from './Settings.module.css'
import Form from './Form/Form'
import { useHistory } from 'react-router-dom'

const Settings = () => {
    const history = useHistory()
    const user = JSON.parse(localStorage.getItem('profile'))

    if (!user) {
        history.push('/login')
        return null
    }

    return (
        <div className={styles.page}>
            <Form user={user} styles={styles} />
        </div>
    )
}

export default Settings
