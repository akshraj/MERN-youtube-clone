import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../services/firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const Container = styled.div`
  width:100%;
  height:100%;
  position:fixed;
  letf:0;
  top:0;
  background-color:#000000a7;
  display:flex;
  justify-content:center;
  align-items: center;
  z-index:999;
`
const Wrapper = styled.div`
  width:600px;
  height:600px;
  background-color:${({ theme }) => theme.bgLighter};
  color:${({ theme }) => theme.text};
  padding:20px;
  display: flex;
  flex-direction: column;
  position: relative;
  gap:20px;
`
const Close = styled.div`
  position:absolute;
  top:10px;
  right:10px;
  cursor: pointer;
`
const Title = styled.h1`
  text-align:center;
`

const Input = styled.input`
  border:1px solid ${({ theme }) => theme.soft};
  color:${({ theme }) => theme.text};
  border-radius:3px;
  padding:10px;
  background-color:transparent;
`
const Desc = styled.textarea`
  border:1px solid ${({ theme }) => theme.soft};
  color:${({ theme }) => theme.text};
  border-radius:3px;
  padding:10px;
  background-color:transparent;
`

const Button = styled.button`
  border-radius:3px;
  border:none;
  padding:10px 20px;
  font-weight:500;
  cursor:pointer;
  background-color: ${({ theme }) => theme.soft};
  color:${({ theme }) => theme.textSoft};
`

const Label = styled.label`
  font-size:14px;
`

export default function Upload({ setOpen }) {
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
  const [imgPerc, setImgPerc] = useState(0);
  const [videoPerc, setVideoPerc] = useState(0);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);


  const navigate = useNavigate();

  const handleTags = (e) => {
    setTags(e.target.value.split(','));
  }

  const uploadFile = (file, urlType) => {
    console.log(urlType);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        urlType === "imgUrl" ? setImgPerc(Math.round(progress)) : setVideoPerc(Math.round(progress));
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setInputs(prev => {
            return {
              ...prev,
              [urlType]: downloadURL,
            }
          })
        });
      }
    );
  }

  const handleChange = (e) => {
    setInputs(prev => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      }
    });
  }

  useEffect(() => {
    video && uploadFile(video, 'videoUrl')
  }, [video]);

  useEffect(() => {
    img && uploadFile(img, 'imgUrl');
  }, [img]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/videos', { ...inputs, tags });
      setOpen(false);
      res.status === 200 && navigate(`/video/${res.data._id}`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Container>
      <Wrapper>
        <Close onClick={() => setOpen(false)}>X</Close>
        <Title>Upload a New Video</Title>
        <Label>Video:</Label>
        {videoPerc > 0 ? (
          "Uploading:" + videoPerc + '%'
        ) : (
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
          />
        )}
        <Input type="text" placeholder="Title" name="title" onChange={handleChange} />
        <Desc placeholder="Description" name="desc" row={8} onChange={handleChange} />
        <Input type="text" placeholder="Separate the tags with commas." onChange={handleTags} />
        <Label>Image:</Label>
        {imgPerc > 0 ? "uploading:" + imgPerc + "%" : <Input type="file" accept="image/*" onChange={(e) => setImg(e.target.files[0])} />}
        <Button onClick={handleUpload}>Upload</Button>
      </Wrapper>
    </Container>
  )
}
