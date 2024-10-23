async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const formData = new URLSearchParams({ email, password });

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            document.getElementById('loginError').innerText = errorMessage;
            return;
        }

        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const state = document.getElementById('signupState').value;
    const city = document.getElementById('signupCity').value;
    const address = document.getElementById('signupAddress').value;
    const pincode = document.getElementById('signupPincode').value;

    const formData = new URLSearchParams({ email, password, phone, state, city, address, pincode });

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            document.getElementById('signupError').innerText = errorMessage;
            return;
        }

        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error:', error);
    }
}