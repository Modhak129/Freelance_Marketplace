function NavBar () {

  return (
    <nav className="bg-white shadow-md">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            FreelanceHub
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/projects" className="text-gray-600 hover:text-indigo-600">
              Browse Projects
            </Link>
            {isAuthenticated ? (
              <>
                {user && !user.is_freelancer && (
                  <Link to="/post-project" className="btn btn-primary">
                    Post Project
                  </Link>
                )}
                <Link to={`/profile/${user.id}`} className="text-gray-600 hover:text-indigo-600">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar