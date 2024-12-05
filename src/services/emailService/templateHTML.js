const verifyEmail = (link) => {
	return `
        <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirm Your Account</title>
                <style>
                    body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    }
                    .email-container {
                    max-width: 600px;
                    background-color: #ffffff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .logo {
                    margin-bottom: 20px;
                    }
                    .logo img {
                    width: 50px;
                    height: 50px;
                    }
                    .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    }
                    .content {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 30px;
                    }
                    .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    }
                    .button:hover {
                    background-color: #0056b3;
                    }
                    .footer {
                    margin-top: 30px;
                    font-size: 14px;
                    color: #aaa;
                    }
                    .footer a {
                    color: #aaa;
                    text-decoration: none;
                    }
                    .footer a:hover {
                    text-decoration: underline;
                    }
                </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="logo">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZaUzw2pmQvD8BFibZ8F9fcoyJGGjYAxe6NA&s" alt="Logo">
                        </div>
                        <div class="title">Confirm your account</div>
                        <div class="content">
                            Please click the button below to confirm your email address and finish setting up your account. This link is valid for 48 hours.
                        </div>
                        <a href="${link}" class="button">Confirm</a>
                        <div class="footer">
                            Express | Thank you for sign up
                        </div>
                    </div>
                </body>
            </html>
`;
};


const passwordReset = (link) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Account</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            }
            .email-container {
            max-width: 600px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
            margin-bottom: 20px;
            }
            .logo img {
            width: 50px;
            height: 50px;
            }
            .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            }
            .content {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
            }
            .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            .button:hover {
            background-color: #0056b3;
            }
            .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #000;
            }
        </style>
        </head>
            <body>
                <div class="email-container">
                    <div class="logo">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZaUzw2pmQvD8BFibZ8F9fcoyJGGjYAxe6NA&s" alt="Logo">
                    </div>
                    <div class="title">Reset your password</div>
                    <div class="content">
                        You're receiving this e-mail because you requested a password reset for your Flash account.
                    </div>
                    <div class="content">
                        Please tap the button below to choose a new password.
                    </div>
                    <a href="${link}" class="button">Confirm</a>
                    <div class="footer">
                        Express | If you do not want to change your password or didn't request a reset, you can ignore and delete this email.
                    </div>
                </div>
            </body>
        </html>
    `;
};

export default { verifyEmail, passwordReset};