import React from "react";
import Toast from "react-bootstrap/Toast";
import "./index.scss";

const Notification = (props) => {
    const { isOpen, title, text, variant } = props;
    const [show, setShow] = React.useState(isOpen);

    return (
        <div className="toaster">
            <Toast onClose={() => setShow(false)} className={variant} show={show} delay={2000}>
                <Toast.Header>
                    <strong className="mr-auto">{title}</strong>
                    <small>{new Date().toLocaleString()}</small>
                </Toast.Header>
                <Toast.Body>{text}</Toast.Body>
            </Toast>
        </div>
    );
};

export default Notification;