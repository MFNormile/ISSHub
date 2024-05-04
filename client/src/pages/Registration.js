import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function Registration() {
  const history = useHistory(); // Define history
  const [message, setMessage] = useState(""); // Initialize message state

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPass: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().min(6).max(20).required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(10).max(25).required("Password is required"),
    confirmPass: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const onSubmit = (data, { setSubmitting }) => {
    axios.post("http://localhost:3001/auth", data)
      .then(response => {
        console.log("Success:", response.data);
        alert(JSON.stringify(response.data)); // Set message from response
        if (response.data === "Success") history.push("/login");
      })
      .catch(error => {
        console.error("Error:", error);
        setMessage(error.response.data.error); // Set error message
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div>
      {message && <div className="error-message">{message.error}</div>}
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form className="formContainer">
          <label>Username: </label>
          <ErrorMessage name="username" component="span" />
          <Field
            autoComplete="off"
            id="inputCreatePost"
            name="username"
            placeholder="(Ex. John123...)"
          />

          <label>Email: </label>
          <ErrorMessage name="email" component="span" />
          <Field
            autoComplete="off"
            id="inputCreatePost"
            name="email"
            placeholder="(Ex. John123...)"
          />

          <label>Password: </label>
          <ErrorMessage name="password" component="span" />
          <Field
            autoComplete="off"
            type="password"
            id="inputCreatePost"
            name="password"
            placeholder="Your Password..."
          />

          <label>Confirm Password: </label>
          <ErrorMessage name="confirmPass" component="span" />
          <Field
            autoComplete="off"
            type="password"
            id="inputCreatePost"
            name="confirmPass"
            placeholder="Confirm your Password..."
          />

          <button type="submit">Register</button>
        </Form>
      </Formik>
    </div>
  );
}

export default Registration;