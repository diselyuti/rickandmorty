import './index.css';
import {useEffect, useState} from "react";
import FacebookLogin from 'react-facebook-login';

function App() {
  const [list, setList] = useState();
  const [listLikeForUser, setListLikeForUser] = useState([]);
  const [character, setCharacter] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCharacterId, setSelectedCharacterId] = useState();
  const [episodes, setEpisodes] = useState();
  const [searchValue, setSearchValue] = useState();
  const [login, setLogin] = useState(false);
  const [data, setData] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const [likeList, setLikeList] = useState([]);
    const responseFacebook = (response) => {
        setData(response);
        if (response.accessToken) {
            setLogin(true);
        } else {
            setLogin(false);
        }
    }

  useEffect(()=>{
      if (showLiked){
          Promise.all(likeList.filter(el => el.user === (data.name ? data.name : 'guest')).map(like=>fetch('https://rickandmortyapi.com/api/character/' + like.id))).then(responses =>
              Promise.all(responses.map(res => res.json()))
          ).then(likes => {
              setListLikeForUser(likes);
          })
      }
  }, [showLiked]);
  useEffect(()=>{
      const likeList = JSON.parse(localStorage.getItem('likeList'));
      if (likeList) {
          setLikeList(likeList);
      }
  }, [])

  useEffect(()=>{
      if (!searchValue)
      {
          fetch('https://rickandmortyapi.com/api/character/?page=' + currentPage)
              .then((response) => {
                  return response.json();
              })
              .then((data) => {
                  if (data.error){
                      console.log(data.error);
                  } else setList(data);
              });
      }else if (showLiked){

      } else {
          fetch('https://rickandmortyapi.com/api/character/?page=' + currentPage + '&name=' + searchValue)
              .then((response) => {
                  return response.json();
              })
              .then((data) => {
                  if (data.error){
                      console.log(data.error);
                      setList([]);
                  } else setList(data);
              });
      }
  }, [currentPage, searchValue, showLiked]);

  useEffect(()=>{
      if (selectedCharacterId) {
          let index = likeList.findIndex(el => el.id === selectedCharacterId && el.user === (data.name ? data.name : 'guest'));
          if (index !== -1) {
              setIsLiked(true);
          }else{
              setIsLiked(false);
          }
          fetch('https://rickandmortyapi.com/api/character/' + selectedCharacterId)
              .then((response) => {
                  return response.json();
              })
              .then((data) => {
                  if (data.error) {
                      console.log(data.error);
                  } else setCharacter(data);
              });
      }
  }, [selectedCharacterId]);

  function fetchEpisodes(){
      Promise.all(character.episode.map(url=>fetch(url))).then(responses =>
          Promise.all(responses.map(res => res.json()))
      ).then(episodes => {
          setEpisodes(episodes);
      })
  }

  function clickLike(id){
      let index = -1;
      if (data.name){
          index = likeList.findIndex(el => (el.user === data.name && el.id === id));
      }else{
          index = likeList.findIndex(el => (el.user === 'guest' && el.id === id));
      }
      if (index === -1) {
          likeList.push({user: data.name ? data.name : 'guest', id: id});
          setIsLiked(true);
      }else {
          likeList.splice(index, 1);
          setIsLiked(false);
      }
      setLikeList(likeList);
      localStorage.setItem('likeList', JSON.stringify(likeList));
  }

  return (
      <div className="app">
          {
              list ?
                  list.length === 0 ?
                      <div className='list message'>No matches were found</div>
                      :
                      <div className='list'>
                          {
                              showLiked && listLikeForUser ?
                                  listLikeForUser.map(character => {
                                      return(
                                          <div key={character.id} className='character' onClick={()=> {
                                              setSelectedCharacterId(character.id);
                                              setEpisodes();
                                          }}>
                                              <div>{character.name}</div>
                                              <div>{character.status}</div>
                                          </div>
                                      );
                                  })
                                  :
                                  list.results.map(character => {
                                      return(
                                          <div key={character.id} className='character' onClick={()=> {
                                              setSelectedCharacterId(character.id);
                                              setEpisodes();
                                          }}>
                                              <div>{character.name}</div>
                                              <div>{character.status}</div>
                                          </div>
                                      );
                                  })
                          }
                          {
                              !showLiked ?
                                  <div className='pages'>
                                      {
                                          currentPage > 1 ?
                                              <i className="fa-solid fa-arrow-left-long ico" onClick={()=> setCurrentPage(currentPage - 1)}/>
                                              :
                                              <i className="fa-solid fa-basketball ico"/>
                                      }
                                      <div className='page'>{currentPage}</div>
                                      {
                                          currentPage*20 < list.info.count ?
                                              <i className="fa-solid fa-arrow-right ico" onClick={()=> setCurrentPage(currentPage + 1)}/>
                                              :
                                              <i className="fa-solid fa-dog ico"/>
                                      }
                                  </div>
                                  :
                                  ''
                          }

                      </div>
                  :
                  <div className='list message'>Loading..</div>
          }
          <div className='right-section'>
              <div className='search'>
                  <input className='search'
                         type="text" placeholder='Search by Name'
                         onInput={(e)=>{
                             setSearchValue(e.target.value);
                             setCurrentPage(1);
                         }}/>
              </div>

              <div className='content'>
                  {
                      character ?
                          <div className='show-character'>
                              <div className='header'>
                                  <div className='main-info'>
                                      <div className='name'>
                                          <h1>{character.name}</h1>
                                          {

                                              !isLiked && likeList ?
                                                  <i className="fa-regular fa-heart like" onClick={() => clickLike(character.id)}/>
                                                  :
                                                  <i className="fa-solid fa-heart like" onClick={() => clickLike(character.id)}/>
                                          }
                                      </div>

                                      <div className='description'>
                                          <h3>Species:</h3>
                                          <h3>{character.species}</h3>
                                      </div>
                                      <div className='description'>
                                          <h3>Gender:</h3>
                                          <h3>{character.gender}</h3>
                                      </div>
                                      <div className='description'>
                                          <h3>Status:</h3>
                                          <h3>{character.status}</h3>
                                      </div>
                                  </div>
                                  <img src={character.image} alt="image"/>
                              </div>
                              <div className='more-info'>
                                  <div className='section-location-episode'>
                                      <div className='location'>
                                          <h3>Location:</h3>
                                          <h3>{character.location.name}</h3>
                                      </div>
                                      <div className='episodes'>
                                          <h3>Episodes:</h3>
                                          {
                                              !episodes ?
                                                  <div className='button' onClick={fetchEpisodes}>Show episodes</div>
                                                  :
                                                  <div className='list'>
                                                      {
                                                          episodes.map(episode => {
                                                              return(
                                                                  <div key={'episode' + episode.id} className='element'>
                                                                      <div>{episode.name}</div>
                                                                      <div>{episode.episode}</div>
                                                                  </div>
                                                              );
                                                          })
                                                      }
                                                  </div>
                                          }
                                      </div>
                                  </div>
                                  <div className='created'>
                                      <h3>Created:</h3>
                                      <h3>{new Date(character.created).toLocaleString()}</h3>
                                  </div>
                              </div>
                          </div>
                          :
                          <div className='not-selected'>Character not selected</div>
                  }
              </div>
              <div className='profile'>
                  {
                      !login ?
                          <FacebookLogin
                              appId="1192986114786318"
                              autoLoad={true}
                              fields="name,email,picture"
                              scope="public_profile,user_friends"
                              callback={responseFacebook}
                              icon="fa-facebook" />
                          :
                          <div>
                              <h3>Profile:</h3>
                              <h3>{data.name}</h3>
                              {
                                  likeList.findIndex(el => el.user === (data.name ? data.name : 'guest')) !== -1 ?
                                      !showLiked ?
                                          <h3 className='button' onClick={()=>setShowLiked(!showLiked)}>Show liked</h3>
                                          :
                                          <h3 className='button' onClick={()=>setShowLiked(!showLiked)}>Hide liked</h3>
                                      :
                                      ''
                              }
                          </div>
                  }
              </div>
          </div>
      </div>
  );
}

export default App;
