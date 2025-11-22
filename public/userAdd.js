document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const form = event.target;
    const formData = new FormData(form);
  
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      gender: formData.get('gender'),
      dateOfBirth: formData.get('dateOfBirth'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      country: formData.get('country'),
      postalCode: formData.get('postalCode'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };
  
    if (data.password !== data.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    try {
      const response = await fetch('/userReg/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert('Registration successful');
        window.location.href = '/index.html';
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed');
    }
  });
  

