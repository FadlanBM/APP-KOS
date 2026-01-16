import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons, FontAwesome, Entypo } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { Alert } from "react-native";
import api from "../../utils/api";

export default function LoginScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setHasProfile = useAuthStore((s) => s.setHasProfile);

  const schema = z.object({
    email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
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
      {/* Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Formik
        initialValues={{ email: "", password: "" }}
        validate={validate}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const { data } = await api.post("/auth/login", {
              email: values.email,
              password: values.password,
            });

            const token = data.data.access_token;
            const userProfile = data.data.user;

            if (token) {
              await setToken(token);
              if (userProfile) {
                await setProfile(userProfile);
              }

              // Pengecekan profil setelah login sukses dengan menyertakan token
              try {
                await api.get("/profile", {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                await setHasProfile(true);
              } catch (profileError) {
                if (
                  profileError.response?.status === 404 ||
                  profileError.response?.data?.error === "Profil belum dibuat"
                ) {
                  await setHasProfile(false);
                } else {
                  await setHasProfile(true);
                }
              }
            } else {
              Alert.alert(
                "Login Gagal",
                "Token tidak ditemukan dalam response"
              );
            }
          } catch (error) {
            console.error(
              "Login Error:",
              error.response?.data?.error || error.message
            );
            const errorMessage =
              error.response?.data?.error || "Email atau password salah";
            Alert.alert("Login Gagal", errorMessage);
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
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Login to your account now</Text>

            <View style={styles.field}>
              <TextInput
                style={[
                  styles.input,
                  touched.email && errors.email ? styles.inputError : null,
                ]}
                placeholder="Email Address"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    touched.password && errors.password
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="Password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
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

            <View style={styles.optionsRow}>
              <Pressable
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </Pressable>

              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("register")}>
                <Text style={styles.signUpText}>Sign Up here</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 12,
    marginBottom: 20,
    width: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    paddingHorizontal: 4,
  },
  inputError: {
    borderBottomColor: "#f87171",
  },
  field: {
    marginBottom: 20,
  },
  fieldInputWrapper: {
    position: "relative",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  passwordInputWrapper: {
    flex: 1,
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
    marginTop: 6,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    height: 18,
    width: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#444",
    borderColor: "#444",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#444",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#444",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#444",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  orLoginText: {
    textAlign: "center",
    color: "#888",
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
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  noAccountText: {
    fontSize: 14,
    color: "#555",
  },
  signUpText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
