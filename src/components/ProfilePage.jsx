import '../styles/ProfilePage.css';
import { useState } from 'react';
import ProfileImg from '../assets/profile.svg';
import checkNickname from './CheckNickname'; 

const ProfilePage = () => {
  const [profileImage, setProfileImage] = useState(null); // 초기값을 null로 설정
  const [nickname, setNickname] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(null); 
  const [socialId, setSocialId] = useState(localStorage.getItem("socialId")); 

  const teams = [
    'LG_TWINS', 'KT_WIZ', 'SSG_LANDERS', 'NC_DINOS', 'DOOSAN_BEARS',
    'KIA_TIGERS', 'LOTTE_GIANTS', 'SAMSUNG_LIONS', 'HANHWA_EAGLES', 'KIWOOM_HEROES'
  ];

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file); // File 객체를 상태에 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('profile-image-preview').src = e.target.result; // 미리보기 추가
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일을 선택해주세요.');
    }
  };

  const handleImageClick = () => {
    document.getElementById('file-upload').click();
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameChecked(null);
    localStorage.setItem("nickname",e.target.value);
  };

  const handleTeamChange = (e) => {
    setFavoriteTeam(e.target.value);
    localStorage.setItem("favoriteClub",e.target.value);
  };

  const handleCheckNickname = async () => {
    if (nickname.trim()) {
      const isValid = await checkNickname(nickname);
      setIsNicknameChecked(isValid);
      
      if (!isValid) {
        console.log('이미 사용 중인 닉네임입니다.');
      } else {
        console.log('사용 가능한 닉네임입니다.');
      }
    } else {
      console.log('닉네임을 입력해주세요.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    if (!isNicknameChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    if (!socialId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('socialId', socialId);
      formData.append('nickname', nickname);
      formData.append('favoriteClub', favoriteTeam);
      if (profileImage) {
        formData.append('profileImg', profileImage); // File 객체 추가
      }

      const response = await fetch('https://dev.yahho.shop/members/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const memberId = data.result.id;
        localStorage.setItem("memberId", memberId); 
        console.log("멤버아이디 : ",memberId);
        console.log('회원 정보가 성공적으로 생성되었습니다.');
      } else {
        alert("사진, 닉네임, 최애구단 모두 설정하셨나요?");
        console.error('회원 생성에 실패했습니다.');
        const errorData = await response.json(); 
        console.error('오류 메시지:', errorData);
      }
    } catch (error) {
      console.error('회원 생성 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <div className="profile-page">
      <div className="title-box"></div>
      <h1 className="title">프로필 설정</h1>

      <div className="profile-img" onClick={handleImageClick}>
        <img id="profile-image-preview" src={ProfileImg} alt="Profile" width="100" height="100" />
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

      <form className="profile-form" onSubmit={handleFormSubmit}>
        <label className="name-label">닉네임</label>
        <input
          type="text"
          className="name-input"
          placeholder="행복한 야빠"
          value={nickname}
          onChange={handleNicknameChange}
        />
        <button type="button" className="name-check" onClick={handleCheckNickname}>
          중복확인
        </button>
        {isNicknameChecked === false && (
          <p className="name-error">이미 사용 중인 닉네임입니다.</p>
        )}
        {isNicknameChecked === true && (
          <p className="name-success">사용 가능한 닉네임입니다.</p>
        )}

        <label className="team-label">최애구단 설정</label>
        <select className="team-select" value={favoriteTeam} onChange={handleTeamChange}>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
        <button type="button" className="team-check">설정완료</button>
                
        <div>
          <button type="submit" className="next-btn">다음으로</button>        
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
