import React, { Component } from 'react'
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      
      static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
      }
    
      componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
        // alertify.error(error?.message || errorInfo || 'Unknown error boundary');
      }

      resetError = ()=>{
        this.setState({'hasError': false})
      }

      handleReset = async() => {
        this.setState({'hasError':false});
        await localStorage.clear();
        await sessionStorage.clear();
        window.location.replace('/login');  
      }
    
      render() {
        if (this.state.hasError) {
          // You can render any custom fallback UI
            return (
                <div className='h-screen bg-blue-16 flex items-center justify-center'>
                  <div className='flex flex-col items-center justify-center border-2 border-amber-600 rounded w-1/2 h-1/3'>
                    <h2>Something went wrong. Contact the developer</h2>
                    <button className='bg-blue-errorBoundary py-1 px-2 m-4 rounded' onClick={this.handleReset}>Logout</button>
                  </div> 
                </div>
            );
        }
    
        return this.props.children; 
      }
}
