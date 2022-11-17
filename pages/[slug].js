import Message from "../components/message";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {auth, db} from "../utils/firebase";
import { toast } from "react-toastify";
import { arrayUnion, doc, getDoc, Timestamp, updateDoc, onSnapshot } from "firebase/firestore";


export default function Details(){
    const router = useRouter();
    const routeData = router.query;
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    //Submit a message
    const submitMessage = async () => {
        //Check if the user is logged in
        if(!auth.currentUser) return router.push("/auth/login");

        if(!message){
            toast.error("Please add a message", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            });
        return;
        }
        const docRef = doc(db, 'posts', routeData.id);
        await updateDoc(docRef, {
            comments: arrayUnion({
                message,
                avatar: auth.currentUser.photoURL,
                userName: auth.currentUser.displayName,
                time: Timestamp.now(),
            }),
        });
        setMessage("");
    };

    //Get comments from DB
const getComments = async () => {
        const docRef = doc(db, 'posts', routeData.id);
        const unsubscripe = onSnapshot(docRef, (snapshot) => {
            setAllMessages(snapshot.data().comments);
        });
            return unsubscripe;   
    };

useEffect(() => {
        if(!router.isReady) return;
        getComments();
    }, [router.isReady]);

    return(
        <div>
            <Message {...routeData}>

            </Message>
            <div className="my-4">
                <div className="flex">
                    <input 
                        onChange={(e) => setMessage(e.target.value)} 
                        type="text" 
                        value={message} 
                        placeholder="Add a Comment"
                        className="bg-gray-800 w-full p-2 text-white text-sm" 
                    />
                    <button 
                        onClick={submitMessage}
                        className="bg-cyan-500 text-white py-2 px-4 text-sm">
                        Submit
                    </button>
                </div>
                <div className="py-6">
                    <h2 className="font-bold">Comments</h2>
                    {allMessages.map((message) => (
                        <div className="bg-white p-4 my-4 border-2">
                            <div className="flex item-center gap-2 mb-4">
                                <image className="w-10 rounded-full" src={message.avatar} alt="" />
                                <h2>{message.userName}</h2>
                            </div>
                            <h2>{message.message}</h2>
                        </div>
                    ))} 
                </div>
            </div>
        </div>
    );
}