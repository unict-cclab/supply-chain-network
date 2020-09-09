import axios from 'axios';
import authHeader from './AuthHeader';

class AuthService {
  login(username, password) {
    return axios
      .post(window.REACT_APP_API_URL + 'login', {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          return axios.get(window.REACT_APP_API_URL + 'me', {
            headers: { Authorization: 'Bearer ' + response.data.accessToken }
          }).then(user => {
            if(user.data.role)
              response.data.role = user.data.role;
              localStorage.setItem('user', JSON.stringify(response.data));
              return response.data;
          });
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(username, password) {
    return axios.post(window.REACT_APP_API_URL + 'users/', {
      username,
      password
    },{
      headers: authHeader(),
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

}

export default new AuthService();