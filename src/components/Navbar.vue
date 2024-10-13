<template>
  <nav class="navbar">
    <div class="navbar-brand">K-MUTTRACK</div>
    <ul class="navbar-menu">
      <li><a href="#">Home</a></li>
      <li><a href="#">Status</a></li>
      <li><a href="#">About K-MUTTRACK</a></li>
    </ul>
  </nav>
</template>
  
  <script>
  
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #ff6600;
    color: white;
    height: 30px;
    font-family: 'Arial', sans-serif;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .navbar-menu {
    list-style: none;
    display: flex;
    gap: 1.5rem;
  }
  
  .navbar-menu li {
    display: inline;
    margin: 0 25px;
  }
  
  .navbar-menu a {
    color: white;
    text-decoration: none;
  }
  
  .navbar-menu a:hover {
    text-decoration: underline;
  }
  </style>
  