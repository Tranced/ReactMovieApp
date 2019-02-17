import React, { Component, useState} from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';

import './App.css';

const key = process.env.REACT_APP_SECRET_KEY;

//stateless components
const Title = ({title}) => <h1 className = 'Title'> {title} </h1>;
const Overview = ({overview}) => <div className = 'Overview'> {overview} </div>;
const VoteAvg = ({voteAvg}) => <div className = 'VoteAvg'> Rating: {voteAvg} </div>;
const ReleaseDate = ({releaseDate}) => <div className = 'ReleaseDate'> Date: {releaseDate} </div>;

const movieCardStyle = {
  display:"flex"
}

const buttonBarStyle = {
  position: "-webkit-sticky",
  position:"sticky",
  top:0
}


//Movie Card Component with Hook
const MovieCard = (props) => {
  
  const [favorited, setFavorited] = useState(false);
  
  const handleClick = (favorited, props) => {
    setFavorited(!favorited);
    return props.toggleFave(props.title);
  }
  
  return(
          <Card className = "Movie-Card" style={movieCardStyle}>

           <img className = "Poster"
            sizes="(max-width:342px) 200px,
                   (min-width:342px) 20em" 
            srcSet={`https://image.tmdb.org/t/p/w342${props.poster} 280w, 
                     https://image.tmdb.org/t/p/w500${props.poster} 500w`}
            alt={props.title}/>

            <CardContent className = 'Movie-Card-Info'>
              <Title title = {props.title} />
              <VoteAvg voteAvg = {props.voteAvg} />
              <ReleaseDate releaseDate = {props.releaseDate}/>
              <Overview overview = {props.overview}/>
            </CardContent>

            <CardActionArea onClick={() => handleClick(favorited, props)}>
                <Button className = "favorite" color = {favorited ? "secondary" : "primary"} variant = "contained"> favorite/unfavorite </Button>
            </CardActionArea>

          </Card>
  )

}
class MovieApp extends Component {
  constructor(props){
    super(props);
    // switched out manual bind for arrow function
    //bind so addRemoveFave knows to refer to Movie App's state when passed into child
    // this.addRemoveFave = this.addRemoveFave.bind(this);
    this.state = {
        sortBy:"None",
        favoriteToggle:false,
        favorited:[],
        movies: [],

    }
  }

  //Call the API during componentWillMount
  componentWillMount(){
    this.loadMovies(key);
  }

  loadMovies = async (key) => {
    // Used to be in componentDidMount
    // fetch("https://api.themoviedb.org/3/movie/now_playing?api_key="+key+"&language=en-US")
    // .then(response => {
    //   return response.json();
    // })
    // //Create movie's array from response.results
    // .then(data => {
    //   this.setState({movies: data.results});
    //   return data.results;
    // });
    const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${key}&language=en-US`);
    const data = await response.json();
    const movies = await data.results;
    this.setState({movies: movies});
  }

  addRemoveFave = (title) => {
      //Make a copy of state's favorited array
      let oldState = [...this.state.favorited];

      //find the title
      const found = oldState.findIndex((x)=> x.title === title );

      //if it's found, remove it from the old state, else add the movie by looking for it's object in the movies array
      found >= 0 ? oldState.splice(found,1) : oldState.push( this.state.movies.find( (x) => x.title === title));
      
      //update favorited
      this.setState({favorited:oldState});
    
  }




  render() {
    let moviesToShow;
    //if favorite is toggled, show favorite movies. Else, show regular list of movies
    this.state.favoriteToggle ? moviesToShow = [...this.state.favorited] : moviesToShow = [...this.state.movies];
    
    //sort in ascending order for different filters
    moviesToShow.sort( (a,b)=>{
      switch(this.state.sortBy){
        case "rating":
          return Number(a.vote_average) - Number(b.vote_average);
        case "title":
          return a.title.toUpperCase() < b.title.toUpperCase() ? -1 : 1;
        case "releaseDate":
          return new Date(a.release_date) - new Date(b.release_date);
        default:
          return new Date(a.release_date) - new Date(b.release_date);

      }

    });

    return(
        <div className="MovieApp">

        <div className="button-bar" style={buttonBarStyle}>
          <Button variant = "contained" onClick={()=>this.setState({sortBy:"rating"})}> Rating </Button>
          <Button variant = "contained" onClick={()=>this.setState({sortBy:"releaseDate"})}> Release Date </Button>
          <Button variant = "contained" onClick={()=>this.setState({sortBy:"title"})}> Title </Button>
          <Button variant = "contained" color ={this.state.favoriteToggle ? "secondary" : "primary"} onClick={()=>this.state.favoriteToggle ? this.setState({favoriteToggle:false}) : this.setState({favoriteToggle:true})}> favorited: {this.state.favoriteToggle.toString()} </Button>
        </div>


          {
            //generate moviecards from moviestoshow array
            moviesToShow.map(movie => <MovieCard 
                                                key ={movie.id}
                                                poster = {movie.poster_path}
                                                title = {movie.title} 
                                                overview = {movie.overview} 
                                                voteAvg = {movie.vote_average}
                                                releaseDate = {movie.release_date}
                                                toggleFave = {this.addRemoveFave}

                                      />)
          }


        </div>  

    );
  }
}

export default MovieApp;


