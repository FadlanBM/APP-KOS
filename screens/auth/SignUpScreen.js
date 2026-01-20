import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons, FontAwesome, AntDesign, Entypo } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { z } from "zod";
import { Alert } from "react-native";
import { createHttpHelperFunctions } from "../../store/httpHelperFunctions";
import { StatusBar } from "expo-status-bar";

const { POST } = createHttpHelperFunctions();

export default function SignUpScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [retypePasswordVisible, setRetypePasswordVisible] = useState(false);

  const schema = z
    .object({
      name: z.string().min(1, "Nama wajib diisi"),
      email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
      password: z.string().min(6, "Password minimal 6 karakter"),
      confirmPassword: z.string().min(6, "Ulangi password minimal 6 karakter"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Password tidak sama",
    });

  const validate = (values) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      errors[field] = issue.message;
    }
    return errors;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validate={validate}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await POST({
                url: "/auth/register",
                body: values,
                showToast: false,
                handleErrorStatus: false,
              });
              Alert.alert("Success", "Registrasi berhasil! Silakan login.");
              navigation.navigate("login");
            } catch (error) {
              console.error("Register Error:", error);
              const errorMessage =
                error.message || "Terjadi kesalahan saat registrasi";
              Alert.alert("Error", errorMessage);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              <Text style={styles.title}>Hello!</Text>
              <Text style={styles.subtitle}>
                Please fill in to sign up new account
              </Text>

              <View style={styles.field}>
                <TextInput
                  style={[
                    styles.input,
                    touched.name && errors.name ? styles.inputError : null,
                  ]}
                  placeholder="Full Name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                />
                {touched.name && errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <TextInput
                  style={[
                    styles.input,
                    touched.email && errors.email ? styles.inputError : null,
                  ]}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                />
                {touched.email && errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      touched.password && errors.password
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Password"
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  />
                  <Pressable
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye" : "eye-off"}
                      size={20}
                      color="gray"
                    />
                  </Pressable>
                </View>
                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      touched.confirmPassword && errors.confirmPassword
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Confirm Password"
                    secureTextEntry={!retypePasswordVisible}
                    autoCapitalize="none"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                  />
                  <Pressable
                    onPress={() =>
                      setRetypePasswordVisible(!retypePasswordVisible)
                    }
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={retypePasswordVisible ? "eye" : "eye-off"}
                      size={20}
                      color="gray"
                    />
                  </Pressable>
                </View>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("login")}>
                  <Text style={styles.loginLink}>Log In here</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
    width: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  nameInput: {
    width: "48%",
  },
  inputError: {
    borderBottomColor: "#f87171",
  },
  field: {
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: "#444",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  orText: {
    textAlign: "center",
    color: "#999",
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#777",
  },
  loginLink: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
