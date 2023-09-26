import { SandpackCodeEditor, SandpackContext, CodeEditorRef } from "@codesandbox/sandpack-react/unstyled";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef } from "react";

export function ComponentCodeEditor({
  componentName, sandpack, onEdit
}: {
  componentName: string;
  sandpack: SandpackContext | null;
  onEdit: (componentName: string, file: string, newCode: string) => void;
}) {
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     console.log('saving');
  //     // console.log(editorRef?.current?.getCodemirror());
  //     console.log(sandpack);
  //     const file = sandpack.activeFile;
  //     const newCode = sandpack.files[sandpack.activeFile].code;
  //     onEdit(componentName, file, newCode);
  //   }, 1000);
  //   return () => clearInterval(intervalId);
  // }, [])
  // console.log(`${componentName}:${sandpack.activeFile}`);
  const editorRef = useRef<CodeEditorRef>(null);
  useEffect(() => {
    const editor = editorRef?.current?.getCodemirror();
    if (editor) {
      editor.state.create;
      EditorState;
    }
  }, [componentName]);
  return (
    <>
      <style>{`
        .cm-gutterElement {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cm-scroller {
          display: flex;
          gap: 1rem;
        }
      `}</style>
      <SandpackCodeEditor
        ref={editorRef}
        showTabs={false}
        // initMode="immediate"
        extensions={[
          EditorView.updateListener.of(
            (update: ViewUpdate) => {
              if (update.docChanged) {
                const file = activeFile;
                const newCode = update.state.doc.toString();
                // console.log(`editor change: updating ${componentName}:${file}`);
                onEdit(componentName, file, newCode);
              }
            }
          )
        ]}
        showRunButton={false}
        showLineNumbers
        wrapContent
        showInlineErrors={false} />
    </>
  );
}
