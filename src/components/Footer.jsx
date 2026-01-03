import React from 'react';
import {
    FacebookFilled,
    InstagramFilled,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';

import logo from '../assets/sagrada.png';
import '../styles/footer.css';

export default function Footer() {
    return (
        <footer className="parish-footer">
            <div className="footer-wrap">

                {/* LOGO & BRAND */}
                <div className="footer-col brand-col">
                    <img src={logo} alt="Sagrada Familia Logo" className="footer-brand-logo" />
                    <h2 className="footer-brand-name">Sagrada Familia Parish</h2>
                    <p className="footer-brand-tagline">
                        United in faith, serving with love in the heart.
                    </p>
                </div>

                {/* NAVIGATION */}
                <div className="footer-col">
                    <h4 className="footer-title">Sacraments</h4>
                    <ul className="footer-links">
                        <li><a href="#wedding">Matrimony</a></li>
                        <li><a href="#baptism">Baptism</a></li>
                        <li><a href="#communion">Communion</a></li>
                        <li><a href="#burial">Funeral Services</a></li>
                    </ul>
                </div>

                {/* CONTACT */}
                <div className="footer-col">
                    <h4 className="footer-title">Contact</h4>
                    <div className="footer-contact-details">
                        <p><EnvironmentOutlined className="f-icon" />M.L Quezon St. Bagumbayan, Taguig, Philippines</p>
                        <p><PhoneOutlined className="f-icon" /> 285540437</p>
                        <p><MailOutlined className="f-icon" /> sagradafamiliaparish21@gmail.com</p>
                    </div>
                    <div className="footer-social-icons">
                        <a href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"><FacebookFilled /></a>
                    </div>
                </div>

            </div>

            <div className="footer-copyright">
                <p>&copy; 2025 Sagrada Familia Parish | Social Communications Ministry </p>
            </div>
        </footer>
    );
}