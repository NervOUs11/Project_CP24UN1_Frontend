// // stores/useUserStore.js
// import { defineStore } from 'pinia'

// export const useUserStore = defineStore('user', {
//   state: () => ({
//     studentID: null,
//     username: '',
//     firstName: '',
//     lastName: '',
//     tel: '',
//     alterEmail: '',
//     signature: null,
//     profileImg: null,
//     departmentID: null,
//     facultyID: null,
//     isAuthenticated: false,
//   }),
//   actions: {
//     login(userData) {
//       this.studentID = userData.studentID
//       this.username = userData.username
//       this.firstName = userData.firstName
//       this.lastName = userData.lastName
//       this.tel = userData.tel
//       this.alterEmail = userData.alterEmail
//       this.signature = userData.signature
//       this.profileImg = userData.profileImg
//       this.departmentID = userData.departmentID
//       this.facultyID = userData.facultyID
//       this.isAuthenticated = true
//     },
//     logout() {
//       this.studentID = null
//       this.username = ''
//       this.firstName = ''
//       this.lastName = ''
//       this.tel = ''
//       this.alterEmail = ''
//       this.signature = null
//       this.profileImg = null
//       this.departmentID = null
//       this.facultyID = null
//       this.isAuthenticated = false
//     },
//   },
//   getters: {
//     isLoggedIn: (state) => state.isAuthenticated,
//   },
// })
