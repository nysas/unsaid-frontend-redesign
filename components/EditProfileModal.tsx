"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import AnonymousMark from "@/components/AnonymousMark";
import { useProfile } from "@/components/UserProfileProvider";

const MARK_SEEDS = ["quiet", "still", "drift", "hollow", "north", "dusk"];

function EditProfileForm({
  initialUsername,
  initialBio,
  initialAvatarSeed,
  onClose,
}: {
  initialUsername: string;
  initialBio: string;
  initialAvatarSeed: string;
  onClose: () => void;
}) {
  const { updateProfile } = useProfile();
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [markSeed, setMarkSeed] = useState(initialAvatarSeed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) {
      setError("Usernames are 3–24 characters: letters, numbers, _ or .");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await updateProfile({ username, bio, avatarSeed: markSeed });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't save.");
      return;
    }
    onClose();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-3">Anonymous identity mark</p>
        <div className="flex gap-3">
          {MARK_SEEDS.map((seed) => (
            <button
              key={seed}
              onClick={() => setMarkSeed(seed)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                markSeed === seed ? "border-forest bg-forest-tint" : "border-border-strong"
              }`}
            >
              <AnonymousMark seed={seed} size="md" />
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
      />
      <Textarea
        label="Bio"
        placeholder="A short line about how you show up here."
        rows={3}
        maxLength={140}
        showCount
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

export default function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useProfile();
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      {/* key forces a fresh form (and fresh initial values) each time the modal opens */}
      <EditProfileForm
        key={open ? "open" : "closed"}
        initialUsername={user.username}
        initialBio={user.bio}
        initialAvatarSeed={user.avatarSeed}
        onClose={onClose}
      />
    </Modal>
  );
}

