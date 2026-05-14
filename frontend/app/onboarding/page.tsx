"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAM_CHIPS } from "./chips/examchips";
import { ROLE_CHIPS } from "./chips/rolechip";
import { TAMIL_NADU_TALUKS } from "./chips/taluk";
function ProgressDots({
  step,
}: {
  step: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.6rem",
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => {
        const isDone = i < step;
        const isActive = i === step;

        return (
          <div
            key={i}
            style={{
              height: 4,
              width: isActive ? 38 : 24,
              borderRadius: 999,
              background: isDone
                ? "#00D48A"
                : isActive
                ? "#FFFFFF"
                : "rgba(255,255,255,0.22)",
              transition:
                "all 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [
    selectedExam,
    setSelectedExam,
  ] = useState<string | null>(
    null
  );

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<string | null>(
    null
  );

  const [
    selectedTaluk,
    setSelectedTaluk,
  ] = useState("");

  const allFilled =
    name.trim() !== "" &&
    selectedExam !== null &&
    selectedRole !== null &&
    selectedTaluk !== "";

  const step =
    name.trim() !== ""
      ? selectedExam !== null
        ? 2
        : 1
      : 0;

  const handleSubmit = () => {
    if (!allFilled) return;

    console.log({
      name,
      selectedExam,
      selectedRole,
      selectedTaluk,
    });

    router.push("/subjects");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#07102B 0%, #0D1B48 100%)",
        display: "flex",
        justifyContent: "center",
        padding:
          "clamp(14px, 3vw, 40px)",
        paddingBottom: "120px",
        boxSizing: "border-box",
        fontFamily:
          "'Sora', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            paddingTop: "8px",
            paddingBottom: "1.5rem",
          }}
        >
          {/* LOGO */}
          <div
            style={{
              marginBottom: "1.4rem",
            }}
          >
            <div
              style={{
                fontSize:
                  "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              vaagai
            </div>

            <div
              style={{
                fontSize: "0.95rem",
                color:
                  "rgba(255,255,255,0.72)",
                marginTop: 4,
                letterSpacing:
                  "0.04em",
              }}
            >
              வாகை
            </div>
          </div>

          {/* PROGRESS */}
          <ProgressDots step={step} />
        </div>

        {/* CARD */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius:
              "clamp(24px, 5vw, 36px)",
            padding:
              "clamp(22px, 5vw, 40px)",
            width: "100%",
            boxSizing: "border-box",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.22)",
          }}
        >
          {/* TITLE */}
          <div>
            <h1
              style={{
                fontSize:
                  "clamp(1.7rem, 4vw, 2.2rem)",
                fontWeight: 700,
                color: "#10204F",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Let&apos;s get you set up
            </h1>

            <p
              style={{
                marginTop: 10,
                color: "#8C96B8",
                fontSize:
                  "clamp(0.95rem, 2vw, 1rem)",
                lineHeight: 1.5,
              }}
            >
              Tell us a little about yourself
            </p>
          </div>

          {/* FORM */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.9rem",
            }}
          >
            {/* NAME */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: 700,
                  color: "#10204F",
                  fontSize: "0.95rem",
                }}
              >
                Name / பெயர்
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding:
                    "1rem 1.1rem",
                  borderRadius: 18,
                  border:
                    "1.5px solid #E4E7F2",
                  background:
                    "#F8F9FD",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* EXAM TARGET */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontWeight: 700,
                  color: "#10204F",
                  fontSize: "0.95rem",
                }}
              >
                Exam Target /
                தேர்வு இலக்கு
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(0,1fr))",
                  gap: "0.9rem",
                }}
              >
                {EXAM_CHIPS.map(
                  (exam) => {
                    const isSelected =
                      selectedExam ===
                      exam.id;

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() =>
                          setSelectedExam(
                            isSelected
                              ? null
                              : exam.id
                          )
                        }
                        style={{
                          position:
                            "relative",
                          padding:
                            "1rem",
                          borderRadius: 20,
                          border: `1.5px solid ${
                            isSelected
                              ? "#10204F"
                              : "#E4E7F2"
                          }`,
                          background:
                            isSelected
                              ? "linear-gradient(135deg,#10204F 0%, #32408A 100%)"
                              : "#F8F9FD",
                          color:
                            isSelected
                              ? "#FFFFFF"
                              : "#10204F",
                          textAlign:
                            "left",
                          cursor:
                            "pointer",
                          minHeight: 92,
                          transition:
                            "all 0.25s ease",
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position:
                                "absolute",
                              top: 10,
                              right: 10,
                              width: 20,
                              height: 20,
                              borderRadius:
                                "50%",
                              background:
                                "#4F6AFF",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color:
                                "#FFFFFF",
                            }}
                          >
                            ✓
                          </div>
                        )}

                        <div
                          style={{
                            fontWeight: 700,
                            fontSize:
                              "1rem",
                            marginBottom: 8,
                          }}
                        >
                          {
                            exam.en
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "0.82rem",
                            opacity: 0.88,
                            lineHeight: 1.4,
                          }}
                        >
                          {
                            exam.ta
                          }
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* ROLE */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontWeight: 700,
                  color: "#10204F",
                  fontSize: "0.95rem",
                }}
              >
                I am a / நான் ஒரு
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,minmax(0,1fr))",
                  gap: "0.7rem",
                }}
              >
                {ROLE_CHIPS.map(
                  (role) => {
                    const isSelected =
                      selectedRole ===
                      role.id;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() =>
                          setSelectedRole(
                            isSelected
                              ? null
                              : role.id
                          )
                        }
                        style={{
                          border: `1.5px solid ${
                            isSelected
                              ? "#10204F"
                              : "#E4E7F2"
                          }`,
                          background:
                            isSelected
                              ? "#10204F"
                              : "#F8F9FD",
                          color:
                            isSelected
                              ? "#FFFFFF"
                              : "#10204F",
                          borderRadius: 18,
                          padding:
                            "0.9rem 0.7rem",
                          cursor:
                            "pointer",
                          minHeight: 100,
                          transition:
                            "all 0.25s ease",
                          textAlign:
                            "center",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize:
                              "0.92rem",
                            marginBottom: 6,
                            lineHeight: 1.3,
                          }}
                        >
                          {
                            role.title
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "0.72rem",
                            lineHeight: 1.4,
                            opacity: 0.88,
                          }}
                        >
                          {
                            role.subtitle
                          }
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* TALUK */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: 700,
                  color: "#10204F",
                  fontSize: "0.95rem",
                }}
              >
                Taluk / தாலுகா
              </label>

              <select
                value={
                  selectedTaluk
                }
                onChange={(e) =>
                  setSelectedTaluk(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding:
                    "1rem 1.1rem",
                  borderRadius: 18,
                  border:
                    "1.5px solid #E4E7F2",
                  background:
                    "#F8F9FD",
                  fontSize: "1rem",
                  outline: "none",
                  cursor:
                    "pointer",
                  appearance:
                    "none",
                  WebkitAppearance:
                    "none",
                  boxSizing:
                    "border-box",
                }}
              >
                <option value="">
                  Select Taluk
                </option>

                {TAMIL_NADU_TALUKS.map(
                  (taluk) => (
                    <option
                      key={taluk}
                      value={
                        taluk
                      }
                    >
                      {taluk}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={!allFilled}
            style={{
              width: "100%",
              marginTop: "2.2rem",
              padding: "1rem",
              borderRadius: 20,
              border: "none",
              background:
                allFilled
                  ? "#10204F"
                  : "#E8ECF6",
              color:
                allFilled
                  ? "#FFFFFF"
                  : "#A5AECB",
              fontSize: "1rem",
              fontWeight: 700,
              cursor:
                allFilled
                  ? "pointer"
                  : "not-allowed",
              transition:
                "all 0.25s ease",
              boxShadow:
                allFilled
                  ? "0 10px 24px rgba(16,32,79,0.24)"
                  : "none",
            }}
          >
            {allFilled
              ? "Start Practicing 🚀"
              : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}