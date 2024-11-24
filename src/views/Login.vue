<script setup>
import { ref } from 'vue'
import { login } from '../functions/login'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const doLogin = async () => {
  try {
    const res = await login(username.value, password.value)
    if (res.status === 200) {
      alert("Login successfully")
      router.push("home")
    }
    else if (res.status === 404) {
      alert("User not found")
    }
    else if (res.status === 400) {
      alert("Invalid password")
    }
    else {
      alert("Login failed")
    }
  }
  catch (error) {
    console.log(error)
  }
}
</script>
<template>
    <div class="flex justify-center items-center min-h-screen bg-orange-100">
        <div class="bg-white p-8 rounded-lg shadow-lg text-center w-1/3">
            <h1 class="text-orange-500 text-4xl font-bold mb-8">K-MUTTRACK</h1>
            <form @submit.prevent="handleLogin">
                <div class="mb-6">
                    <label for="username" class="block text-black text-left mb-2">Username</label>
                    <input
                        type="email"
                        id="username"
                        v-model="username"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-full"
                    />
                </div>

                <div class="mb-6">
                    <label for="password" class="block text-black text-left mb-2 ">Password</label>
                    <input
                        type="password"
                        id="password"
                        v-model="password"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-full"
                    />
                </div>

                <button 
                    type="submit" 
                    class="w-full py-3 bg-orange-500 text-white rounded-full text-lg hover:bg-orange-600"
                    @click="doLogin">
                Login
                </button>
                <!-- <p class="mt-4">
                    <router-link to="/signup" class="text-orange-500">Sign Up</router-link>
                </p> -->
            </form>
        </div>
    </div>
</template>
    
<style scoped>
html, body, #app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
  