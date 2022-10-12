import React from "react";
import { Link } from "react-router-dom";
import Image from "../../../assets/images/404.png";
import FourZeroFourStyleWrapper from "./404.style";


/**
 * Renders component when page is not found
 */
const FourZeroFour = () => {
    return (
        <FourZeroFourStyleWrapper className="duncan404Page">
            <div className="duncan404Content">
                <h1> 404 </h1>
                <h3> Looks like you got lost </h3>
                <p> The page you are looking for does not exist or has been moved. </p>

                <Link to="/">
                    <button type="button"> Back Home </button>
                </Link>
            </div>

            <div className="duncan404Artwork">
                <img alt="#" src={Image} />
            </div>
        </FourZeroFourStyleWrapper>
    );
};

export default FourZeroFour;
