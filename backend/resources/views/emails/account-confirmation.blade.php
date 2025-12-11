<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <h2>Welcome to University Accounting System</h2>
    <p>Hello {{ $user->firstname }},</p>
    <p>Thank you for registering with our system. Please click the button below to verify your email address and activate your account.</p>
    
    <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
    
    <p>If you did not create an account, no further action is required.</p>
    
    <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
    <p>{{ $verificationUrl }}</p>
    
    <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} University Accounting System. All rights reserved.</p>
    </div>
</body>
</html>
