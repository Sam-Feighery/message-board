import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import Message from "../components/message";
import Link from "next/link";



export default function Dashboard(){
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [posts, setPosts] = useState([]);
    // is User logged in?
    const getData = async () => {
    if(loading) return;
    if(!user) return router.push('/auth/login');
    const collectionRef = collection(db, 'posts');
    const q = query(collectionRef, where('user', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot => {
        setPosts(snapshot.docs.map((doc) => ({...doc.data(), id:doc.id})))
    }));
        return unsubscribe;
    };

    //Delete post
    const deletePost = async (id) => {
        const docRef = doc(db, 'posts', id);
        await deleteDoc(docRef);
    };

    //Get user data
    useEffect(() => {
        getData();
    }, [user, loading]);

    return (
        <div>
            <h1>Your Posts</h1>
            <div>
                {posts.map((post) => {
                    return (
                        <Message {...post} key={post.id}>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => deletePost(post.id)} 
                                    className="font-medium text-white bg-red-600 py-2 px-4 my-6 rounded">
                                        Delete
                                </button>
                                <Link href={{pathname: "/post", query: post }}>
                                <button className="font-small text-white bg-blue-600 py-2 px-4 my-6 rounded">
                                    Edit
                                </button>
                                </Link>
                            </div>
                        </Message>
                    );
                })}
            </div>
            <button 
            className="font-medium text-white bg-gray-800 py-2 px-4 my-6 rounded" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        </div>
    );
}