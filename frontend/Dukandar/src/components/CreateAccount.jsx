import { useState } from "react";
import css from "../styles/CreateAccount.module.css";
import { CgCalendarDates } from "react-icons/cg";
import axios from "axios";
import { BASE_BACKEND_URL } from "../store/store";

const CreateAccount = ({ onCreate }) => {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
        password: "",
        image: "",
        location: ""
    });

    const [preview, setPreview] = useState(null);

    const update = (k, v) => {
        setForm((s) => ({ ...s, [k]: v }));
    };

    const handleImage = (file) => {
        update("image", file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    async function createUser(user) {
        try {
            const res = await axios.post(BASE_BACKEND_URL + "/users", user)

            if(res)
            {
                console.log("User created Successfully: " + res.data);
            }
        } catch (e) {
            console.log(e);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // SEND form as FormData later

        console.log(form);

        const user = {
            name: form.name,
            location: form.location,
            gender: form.gender,
            dob: form.dob,
            email: form.email,
            phone: form.phone,
            loyaltyPoints: 0,
            imageUrl: form.image,
            password: form.password
        }

        // name, gender, dob, email, phone, password, image(file)
        createUser(user);
    };

    return (
        <div className={css.wrapper}>
            <div className={css.card}>
                <h2 className={css.title}>Create Account</h2>

                <form className={css.form} onSubmit={handleSubmit}>

                    {/* PROFILE IMAGE */}
                    <div className={css.avatar}>
                        {preview ? (
                            <img src={preview} alt="preview" />
                        ) : (
                            <span>Upload</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImage(e.target.files[0])}
                        />
                    </div>

                    <input
                        placeholder="Full Name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                    />

                    <div className={css.dropdown}>
                        <div
                            className={css.dropdownSelected}
                            onClick={() => setOpen(o => !o)}
                        >
                            {form.gender || "Select Gender"}
                        </div>

                        {open && (
                            <div className={css.dropdownMenu}>
                                {["Male", "Female", "Other"].map(g => (
                                    <div
                                        key={g}
                                        className={css.dropdownItem}
                                        onClick={() => {
                                            update("gender", g);
                                            setOpen(false);
                                        }}
                                    >
                                        {g}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className={css.dateWrapper}>
                        <input type="date"
                            value={form.dob}
                            onChange={(e) => update("dob", e.target.value)}
                            required />
                        <span>{form.dob || "Date of Birth"}</span>
                        <CgCalendarDates className={css.calIcon} />
                    </div>

                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                    />

                    <input
                        type="tel"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        required
                    />
                    
                    <input
                        type="text"
                        placeholder="Location"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        required
                    />

                    <button className={css.btn} type="submit">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
