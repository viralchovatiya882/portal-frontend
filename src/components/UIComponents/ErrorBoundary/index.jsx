import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(props) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const { info } = this.state;
        this.setState({
            hasError: true,
            error: error,
            info: errorInfo
        });
        // eslint-disable-next-line no-console	
        console.log(`Error while rendering ${info ? info.componentStack : "Component"}`);
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h4>Something went wrong.</h4>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;