export   const URLparams = (key_name) => {
    try {
        const queryParams = new URLSearchParams(window.location.search)
        const value = queryParams.get(key_name)
        return value
    } catch (error) {
        console.log(error)
    }
}